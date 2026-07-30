<template>
  <view class="page-add-cat">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-content" :style="{ marginTop: statusBarHeight + 'px' }">
        <view class="nav-close" @tap="goBack">
          <text class="nav-close-icon">&#x2715;</text>
        </view>
        <view class="nav-title-area">
          <text class="nav-title">{{ isEditMode ? '编辑猫咪' : '新增猫咪' }}</text>
        </view>
        <view class="nav-spacer"></view>
      </view>
    </view>

    <!-- 滚动区域 -->
    <scroll-view class="main-scroll" scroll-y>
      <view class="scroll-inner" :style="{ paddingTop: navBarTotal + 'px' }">
        <!-- Section A: 位置信息 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F4CC;</text>
            <text class="section-title">位置信息</text>
          </view>

          <!-- 地图预览 -->
          <view class="map-preview">
            <map
              id="previewMap"
              class="map-container"
              :latitude="mapLatitude"
              :longitude="mapLongitude"
              :markers="locationMarker"
              :scale="mapScale"
              @longpress="onMapLongPress"
              @tap="onMapTap"
              @markerdragend="onMarkerDragEnd"
              @initdone="onMapInitDone"
            ></map>
            <view class="map-pin-hint" v-if="!locationSet">
              <text class="pin-hint-text">点击下方搜索按钮获取位置</text>
            </view>
          </view>

          <!-- 地址搜索 -->
          <view class="search-row">
            <view class="search-input-wrap">
              <text class="search-icon">&#x1F50D;</text>
              <input
                class="search-input"
                v-model="form.location"
                placeholder="输入地址，如：杭州市西湖景区"
                placeholder-class="input-placeholder"
                @confirm="searchLocation"
              />
            </view>
            <view class="search-btn" @tap="searchLocation">
              <text class="search-btn-text">搜索</text>
            </view>
          </view>

          <!-- 使用当前位置 -->
          <view class="use-location-row" @tap="useCurrentLocation">
            <text class="location-icon">&#x1F4CD;</text>
            <text class="location-text">使用当前位置</text>
          </view>

          <!-- 已选位置提示 -->
          <view class="location-info" v-if="locationSet">
            <text class="location-label">已定位：</text>
            <text class="location-value">{{ form.location }}</text>
            <text class="location-tag" :class="{ 'tag-ip': isIPFallback, 'tag-gps': !isIPFallback }">
              {{ isIPFallback ? '网络定位·精度低' : 'GPS高精度' }}
            </text>
          </view>
          <text class="map-hint" v-if="locationSet">长按地图可微调位置</text>
        </view>

        <!-- Section B: 猫咪信息 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F408;</text>
            <text class="section-title">猫咪信息</text>
          </view>

          <!-- 昵称 -->
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input
              class="form-input"
              v-model="form.nickname"
              placeholder="给猫咪取个名字"
              placeholder-class="input-placeholder"
            />
          </view>

          <!-- 毛色 & 体型 两列 -->
          <view class="form-grid-2">
            <view class="form-item">
              <text class="form-label">毛色</text>
              <picker class="form-picker" :range="colorOptions" range-key="label" @change="onColorChange">
                <view class="picker-value">
                  <text :class="['picker-text', { 'placeholder': !form.color }]">
                    {{ form.color ? form.color : '选择毛色' }}
                  </text>
                  <text class="picker-arrow">&#x25BC;</text>
                </view>
              </picker>
            </view>
            <view class="form-item">
              <text class="form-label">体型</text>
              <picker class="form-picker" :range="bodyTypeOptions" range-key="label" @change="onBodyTypeChange">
                <view class="picker-value">
                  <text :class="['picker-text', { 'placeholder': !form.bodyType }]">
                    {{ form.bodyType ? form.bodyType : '选择体型' }}
                  </text>
                  <text class="picker-arrow">&#x25BC;</text>
                </view>
              </picker>
            </view>
          </view>

          <!-- 性别 -->
          <view class="form-item">
            <text class="form-label">性别</text>
            <view class="pill-group">
              <view
                v-for="g in genderOptions"
                :key="g.value"
                :class="['pill', { 'pill-active': form.gender === g.value }]"
                @tap="form.gender = g.value"
              >
                <text class="pill-text">{{ g.label }}</text>
              </view>
            </view>
          </view>


          <!-- 性格 -->
          <view class="form-item">
            <text class="form-label">性格</text>
            <view class="pill-group">
              <view
                v-for="p in personalityOptions"
                :key="p.value"
                :class="['pill', { 'pill-active': form.personality === p.value }]"
                @tap="form.personality = p.value"
              >
                <text class="pill-text">{{ p.label }}</text>
              </view>
            </view>
          </view>

          <!-- 亲人程度 -->          <view class="form-item">
            <text class="form-label">亲人程度</text>
            <view class="pill-group">
              <view
                v-for="f in friendlyOptions"
                :key="f.value"
                :class="['pill', { 'pill-active': form.friendly === f.value }]"
                @tap="form.friendly = f.value"
              >
                <text class="pill-text">{{ f.label }}</text>
              </view>
            </view>
          </view>

          <!-- 特征标签 -->
          <view class="form-item">
            <text class="form-label">特征标签</text>
            <input
              class="form-input"
              v-model="form.features"
              placeholder="多个特征用空格分隔"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <!-- Section C: 状态信息 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x2695;</text>
            <text class="section-title">状态信息</text>
          </view>

          <!-- 健康状态 三卡片 -->
          <view class="health-cards">
            <view
              v-for="h in healthOptions"
              :key="h.value"
              :class="['health-card', 'health-' + h.value, { 'health-selected': form.healthStatus === h.value }]"
              @tap="form.healthStatus = h.value"
            >
              <text class="health-icon">{{ h.icon }}</text>
              <text class="health-label">{{ h.label }}</text>
            </view>
          </view>

          <!-- 绝育 -->
          <view class="form-item">
            <text class="form-label">绝育状态</text>
            <view class="pill-group">
              <view
                :class="['pill', { 'pill-active': form.sterilized === 'yes' }]"
                @tap="form.sterilized = 'yes'"
              >
                <text class="pill-text">已绝育</text>
              </view>
              <view
                :class="['pill', { 'pill-active': form.sterilized === 'no' }]"
                @tap="form.sterilized = 'no'"
              >
                <text class="pill-text">未绝育</text>
              </view>
            </view>
          </view>

          <!-- 怀孕 -->
          <view class="form-item">
            <text class="form-label">怀孕</text>
            <view class="pill-group">
              <view
                :class="['pill', { 'pill-active': form.pregnant === 'yes' }]"
                @tap="form.pregnant = 'yes'"
              >
                <text class="pill-text">是</text>
              </view>
              <view
                :class="['pill', { 'pill-active': form.pregnant === 'no' }]"
                @tap="form.pregnant = 'no'"
              >
                <text class="pill-text">否</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Section D: 照片上传 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F4F7;</text>
            <text class="section-title">照片上传</text>
          </view>

          <!-- 上传区 -->
          <view class="upload-area" @tap="choosePhotos" v-if="form.photos.length === 0">
            <view class="upload-icon-wrap">
              <text class="upload-camera-icon">&#x1F4F7;</text>
            </view>
            <text class="upload-title">点击上传照片</text>
            <text class="upload-hint">最多上传9张</text>
          </view>

          <!-- 已选图片预览 -->
          <view class="thumbnail-row" v-else>
            <view
              class="thumbnail-box"
              v-for="(img, idx) in form.photos"
              :key="'img-' + idx"
            >
              <image class="thumbnail-image" :src="img" mode="aspectFill" />
              <view class="thumbnail-delete" @tap="removePhoto(idx)">
                <text class="delete-icon">&#x2715;</text>
              </view>
            </view>
            <view
              class="thumbnail-box thumbnail-add"
              v-if="form.photos.length < 9"
              @tap="choosePhotos"
            >
              <text class="thumbnail-plus-icon">&#x2795;</text>
            </view>
          </view>
        </view>

        <!-- Section E: 喂食选项 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F356;</text>
            <text class="section-title">喂食情况</text>
          </view>
          <view class="feeding-options">
            <view
              v-for="option in feedingOptions"
              :key="option.value"
              :class="['feeding-option', 'feeding-' + option.color, { 'feeding-selected': isFeedingSelected(option) }]"
              @tap="toggleFeedingOption(option)"
            >
              <text class="feeding-option-icon">{{ option.icon }}</text>
              <text class="feeding-option-label">{{ option.label }}</text>
            </view>
          </view>
          <view v-if="form.feedingRecords.length > 0" class="feeding-records-detail">
            <view
              v-for="(record, idx) in form.feedingRecords"
              :key="'feed-' + idx"
              class="feeding-record-item"
            >
              <view class="feeding-record-header">
                <view class="feeding-record-food">
                  <text class="feeding-record-icon">{{ getFeedingIcon(record.foodType) }}</text>
                  <text class="feeding-record-type">{{ record.foodType }}</text>
                </view>
                <view class="feeding-record-delete" @tap="removeFeedingRecord(idx)">
                  <text class="delete-icon-small">&#x2715;</text>
                </view>
              </view>
              <view class="feeding-record-body">
                <view class="feeding-record-row">
                  <text class="feeding-record-label">投喂时间</text>
                  <picker mode="multiSelector" :range="feedingTimeRange" :value="record._timeIndex" @change="(e) => onFeedingTimeChange(e, idx)">
                    <view class="feeding-record-time-picker">
                      <text class="feeding-record-time">{{ record.time }}</text>
                      <text class="picker-arrow-sm">&#x25BC;</text>
                    </view>
                  </picker>
                </view>
                <view class="feeding-record-row">
                  <text class="feeding-record-label">备注</text>
                  <input
                    class="feeding-record-input"
                    v-model="record.content"
                    placeholder="记录投喂情况"
                    placeholder-class="input-placeholder"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- Section F: 备注 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F4DD;</text>
            <text class="section-title">备注</text>
          </view>
          <textarea
            class="form-textarea"
            v-model="form.remark"
            placeholder="活动时间、常驻点位、躲避位置等"
            placeholder-class="input-placeholder"
            :maxlength="500"
            :auto-height="true"
          />
        </view>

        <!-- 底部占位 -->
        <view class="bottom-spacer"></view>
      </view>
    </scroll-view>

    <!-- 固定底部按钮 -->
    <view class="bottom-action" :style="{ paddingBottom: 'calc(60rpx + ' + safeBottom + ')' }">
      <view class="submit-btn" @tap="handleSubmit">
        <text class="submit-btn-text">{{ isEditMode ? '保存修改' : '提交猫咪档案' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { QQ_MAP_GL_KEY, QQ_MAP_LOCATION_KEY } from '@/config/keys'
import { onLoad } from '@dcloudio/uni-app'
import { useCatStore } from '@/store/cat'
import { showSuccess, showError, showLoading, hideLoading } from '@/utils/toast'
import { getLocation } from '@/utils/location'

const catStore = useCatStore()

// 腾讯地图 Key
const QQ_MAP_KEY = QQ_MAP_LOCATION_KEY

// 系统信息
const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 44)
const safeBottom = sysInfo.safeAreaInsets?.bottom
  ? sysInfo.safeAreaInsets.bottom + 'px'
  : 'env(safe-area-inset-bottom)'

// 导航栏总高度
const navBarTotal = computed(() => statusBarHeight.value + 88)

// 默认地图中心（杭州）
const DEFAULT_LAT = 30.2741
const DEFAULT_LNG = 120.1551

// 地图状态
const mapLatitude = ref(DEFAULT_LAT)
const mapLongitude = ref(DEFAULT_LNG)
const mapScale = ref(14)
const locationSet = ref(false)
const isIPFallback = ref(false)
const mapContext = ref(null)

// 选项数据
const colorOptions = [
  { label: '橘色', value: '橘色' },
  { label: '黑色', value: '黑色' },
  { label: '白色', value: '白色' },
  { label: '三花', value: '三花' },
  { label: '狸花', value: '狸花' },
  { label: '灰色', value: '灰色' },
  { label: '其他', value: '其他' }
]

const bodyTypeOptions = [
  { label: '小型', value: '小型' },
  { label: '中等', value: '中等' },
  { label: '大型', value: '大型' }
]

const genderOptions = [
  { label: '未知', value: 'unknown' },
  { label: '公', value: 'male' },
  { label: '母', value: 'female' }
]

const friendlyOptions = [
  { label: '是', value: 'yes' },
  { label: '否', value: 'no' }
]

const personalityOptions = [
  { label: '亲人', value: '亲人' },
  { label: '胆小', value: '胆小' },
  { label: '警惕', value: '警惕' },
  { label: '活泼', value: '活泼' },
  { label: '温顺', value: '温顺' },
  { label: '独立', value: '独立' }
]


const healthOptions = [
  { value: 'healthy', label: '健康', icon: '\u2714' },
  { value: 'minor', label: '轻微伤病', icon: '\u26A0' },
  { value: 'serious', label: '重伤病', icon: '\u2716' }
]

// 表单数据
const form = ref({
  location: '',
  nickname: '',
  color: '',
  bodyType: '',
  gender: 'unknown',
  personality: '',
  friendly: '',
  features: '',
  healthStatus: 'healthy',
  sterilized: '',
  pregnant: '',
  photos: [],
  remark: '',
  feedingRecords: []
})

// 喂食选项
const feedingOptions = [
  { label: '清水', value: 'water', color: 'info', icon: '💧' },
  { label: '猫粮', value: 'cat_food', color: 'primary', icon: '🍚' },
  { label: '肉罐头', value: 'meat_can', color: 'warning', icon: '🥫' },
  { label: '干粮罐头', value: 'dry_can', color: 'success', icon: '🥫' },
  { label: '冻干', value: 'freeze_dried', color: 'purple', icon: '🧊' },
  { label: '猫条', value: 'cat_treats', color: 'pink', icon: '🍖' }
]

// 生成当前时间字符串
function getCurrentTimeStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

// 切换喂食选项
function toggleFeedingOption(option) {
  const index = form.value.feedingRecords.findIndex(r => r.foodType === option.label)
  if (index > -1) {
    form.value.feedingRecords.splice(index, 1)
  } else {
    const now = new Date()
    const timeStr = getCurrentTimeStr()
    form.value.feedingRecords.push({
      foodType: option.label,
      foodColor: option.color,
      content: '已添加',
      time: timeStr,
      _timeIndex: [now.getHours(), Math.floor(now.getMinutes() / 5)]
    })
  }
}

// 删除喂食记录
function removeFeedingRecord(idx) {
  form.value.feedingRecords.splice(idx, 1)
}

// 获取食物图标
function getFeedingIcon(foodType) {
  const map = {
    '清水': '💧',
    '猫粮': '🍚',
    '肉罐头': '🥫',
    '干粮罐头': '🥫',
    '冻干': '🧊',
    '猫条': '🍖'
  }
  return map[foodType] || '🍽️'
}

// 喂食时间选择器数据
const feedingTimeHours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
const feedingTimeMinutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
const feedingTimeRange = [feedingTimeHours, feedingTimeMinutes]

// 编辑模式下的猫咪ID
const editingCatId = ref('')
const isEditMode = computed(() => !!editingCatId.value)

// 加载已有猫咪数据到表单
function loadCatToForm(cat) {
  if (!cat) return
  form.value.nickname = cat.name || ''
  form.value.color = cat.color || ''
  form.value.bodyType = cat.bodyType || ''
  form.value.gender = cat.gender || 'unknown'
  form.value.personality = cat.personality || ''
  form.value.friendly = cat.personality === '亲人' ? 'yes' : (cat.friendly || '')
  form.value.features = (cat.features || []).join(' ')
  form.value.healthStatus = cat.status === 'attention' ? 'minor' : (cat.status === 'urgent' ? 'serious' : 'healthy')
  form.value.sterilized = cat.isSterilized ? 'yes' : (cat.sterilized || '')
  form.value.pregnant = cat.isPregnant ? 'yes' : (cat.pregnant || '')
  form.value.photos = cat.photos || []
  form.value.location = cat.location || ''
  form.value.remark = cat.remark || ''
  mapLatitude.value = cat.latitude || DEFAULT_LAT
  mapLongitude.value = cat.longitude || DEFAULT_LNG
  if (cat.latitude && cat.longitude) {
    locationSet.value = true
  }
  // 加载投喂记录
  form.value.feedingRecords = (cat.feedingRecords || []).map(record => ({
    foodType: record.foodType,
    foodColor: record.foodColor,
    content: record.content || '已添加',
    time: record.time || getCurrentTimeStr(),
    _timeIndex: [new Date().getHours(), Math.floor(new Date().getMinutes() / 5)]
  }))
}

onLoad((options) => {
  if (options && options.id) {
    editingCatId.value = options.id
    const cat = catStore.getCatById(options.id)
    if (cat) {
      loadCatToForm(cat)
      setTimeout(() => {
        mapContext.value = uni.createMapContext('previewMap')
        if (locationSet.value) {
          mapContext.value.moveToLocation({
            latitude: mapLatitude.value,
            longitude: mapLongitude.value
          })
        }
      }, 500)
    }
  }
})


// 时间选择变化
function onFeedingTimeChange(e, idx) {
  const [hIdx, mIdx] = e.detail.value
  const hour = feedingTimeHours[hIdx]
  const minute = feedingTimeMinutes[mIdx]
  const now = new Date()
  const record = form.value.feedingRecords[idx]
  // 更新时间字符串，保留日期部分
  const oldTime = record.time || getCurrentTimeStr()
  const datePart = oldTime.split(' ')[0] || `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  record.time = `${datePart} ${hour}:${minute}`
  record._timeIndex = [hIdx, mIdx]
  // 重新触发响应式
  form.value.feedingRecords.splice(idx, 1, { ...record })
}

// 检查喂食选项是否选中
function isFeedingSelected(option) {
  return form.value.feedingRecords.some(r => r.foodType === option.label)
}

// 地图标记点
const locationMarker = computed(() => {
  if (!locationSet.value) return []
  return [{
    id: 99999,
    latitude: mapLatitude.value,
    longitude: mapLongitude.value,
    title: '猫咪位置',
    width: 32,
    height: 32,
    draggable: true,
    callout: {
      content: form.value.location || '拖动调整位置',
      display: 'ALWAYS',
      borderRadius: 8,
      padding: 8,
      fontSize: 12,
      color: '#333',
      bgColor: '#FF8210'
    }
  }]
})

function onMapInitDone() {
  mapContext.value = uni.createMapContext('previewMap')
  if (isEditMode.value) return
  // Use the map's actual center (IP-based, most reliable in H5)
  mapContext.value.getCenterLocation({
    success: (res) => {
      console.log('[add-cat] map getCenterLocation:', res.latitude, res.longitude)
      mapLatitude.value = res.latitude
      mapLongitude.value = res.longitude
      locationSet.value = true
      reverseGeocode(res.latitude, res.longitude)
    },
    fail: () => {
      // Fallback: try getLocation() if map center is unavailable
      console.warn('[add-cat] getCenterLocation failed, trying getLocation')
      getLocation().then(loc => {
        mapLatitude.value = loc.latitude
        mapLongitude.value = loc.longitude
        locationSet.value = true
        if (mapContext.value) {
          mapContext.value.moveToLocation({
            latitude: loc.latitude,
            longitude: loc.longitude
          })
        }
        reverseGeocode(loc.latitude, loc.longitude)
      }).catch(() => {})
    }
  })
}

// 初始化
onMounted(() => {
  setTimeout(() => {
    mapContext.value = uni.createMapContext('previewMap')
    // Only try getLocation as fallback for initial map display
    // Actual coordinates will be set by onMapInitDone via getCenterLocation
    if (!isEditMode.value) {
      getLocation().then(loc => {
        mapLatitude.value = loc.latitude
        mapLongitude.value = loc.longitude
        if (mapContext.value) {
          mapContext.value.moveToLocation({
            latitude: loc.latitude,
            longitude: loc.longitude
          })
        }
      }).catch(() => {})
    }
  }, 500)
})

// 地址搜索 - 使用腾讯地图 WebService API
function searchLocation() {
  const address = form.value.location.trim()
  if (!address) {
    showError('请输入地址')
    return
  }

  showLoading('搜索位置中...')
  
  // 使用 JSONP 方式调用腾讯地图 WebService API
  const callbackName = 'geoCallback_' + Date.now()
  
  window[callbackName] = function(data) {
    hideLoading()
    if (data && data.status === 0 && data.result && data.result.location) {
      mapLatitude.value = data.result.location.lat
      mapLongitude.value = data.result.location.lng
      mapScale.value = 16
      locationSet.value = true
      showSuccess('位置已定位')
      catStore.setUserLocation({
        latitude: mapLatitude.value,
        longitude: mapLongitude.value
      })
      if (mapContext.value) {
        mapContext.value.moveToLocation({
          latitude: mapLatitude.value,
          longitude: mapLongitude.value
        })
      }
    } else if (data && data.status === 121) {
      // 请求来源未授权 - 提示用户使用地图选点
      showError('地址搜索服务暂不可用，请点击地图选择位置')
    } else {
      showError('未找到该地址，请尝试更详细的描述或点击地图选择位置')
    }
    delete window[callbackName]
    if (script.parentNode) {
      script.parentNode.removeChild(script)
    }
  }

  const script = document.createElement('script')
  script.onerror = () => {
    hideLoading()
    showError('网络错误，请点击地图选择位置')
    delete window[callbackName]
  }
  
  const encodedAddress = encodeURIComponent(address)
  script.src = `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodedAddress}&region=全国&output=jsonp&key=${QQ_MAP_GL_KEY}&callback=${callbackName}`
  document.body.appendChild(script)
}

// 地理编码地址为经纬度（用于提交时自动转换）
function geocodeAddress(address) {
  return new Promise((resolve) => {
    if (!address || !address.trim()) {
      resolve(false)
      return
    }
    uni.request({
      url: TENCENT_MAP_API_BASE + '/geocoder/v1/',
      data: {
        address: address.trim(),
        region: '全国',
        output: 'json',
        key: QQ_MAP_GL_KEY
      },
      method: 'GET',
      success: (res) => {
        const data = res.data
        if (data && data.status === 0 && data.result && data.result.location) {
          mapLatitude.value = data.result.location.lat
          mapLongitude.value = data.result.location.lng
          locationSet.value = true
          isIPFallback.value = false
          console.log('[add-cat] geocodeAddress success:', {
            address: address,
            lat: mapLatitude.value,
            lng: mapLongitude.value
          })
          resolve(true)
        } else {
          console.warn('[add-cat] geocodeAddress failed:', data)
          resolve(false)
        }
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

// 使用当前位置
function useCurrentLocation() {
  showLoading('获取当前位置...')
  uni.getLocation({
    type: 'gcj02',
    altitude: true,
    isHighAccuracy: true,
    highAccuracyExpireTime: 3000,
    success: (res) => {
      mapLatitude.value = res.latitude
      mapLongitude.value = res.longitude
      mapScale.value = 16
      locationSet.value = true
      isIPFallback.value = false
      hideLoading()
      showSuccess('高精度定位成功')
      if (mapContext.value) {
        mapContext.value.moveToLocation({
          latitude: res.latitude,
          longitude: res.longitude
        })
      }
      catStore.setUserLocation({
        latitude: res.latitude,
        longitude: res.longitude
      })
      reverseGeocode(res.latitude, res.longitude)
    },
    fail: () => {
      fallbackToIPLocation()
    }
  })
}

// 反向地理编码 (使用代理)
function reverseGeocode(lat, lng) {
  console.log('[add-cat] reverseGeocode:', lat, lng)
  uni.request({
    url: TENCENT_MAP_API_BASE + '/geocoder/v1/',
    data: {
      location: `${lat},${lng}`,
      output: 'json',
      key: QQ_MAP_GL_KEY
    },
    method: 'GET',
    success: (res) => {
      const data = res.data
      if (data && data.status === 0 && data.result && data.result.address) {
        form.value.location = data.result.address
      }
    }
  })
}

// IP 定位回退 (使用代理)
function fallbackToIPLocation() {
  uni.request({
    url: TENCENT_MAP_API_BASE + '/location/v1/ip',
    data: {
      key: QQ_MAP_GL_KEY,
      output: 'json'
    },
    method: 'GET',
    success: (res) => {
      hideLoading()
      if (res.data && res.data.status === 0 && res.data.result) {
        const loc = res.data.result.location
        mapLatitude.value = loc.lat
        mapLongitude.value = loc.lng
        mapScale.value = 15
        locationSet.value = true
        isIPFallback.value = true
        uni.showModal({
          title: '定位提示',
          content: '当前使用的是网络定位，精度较低。建议手动输入具体地址或在地图上选点以获得更准确的位置。',
          showCancel: false,
          confirmText: '知道了'
        })
        reverseGeocode(loc.lat, loc.lng)
      } else {
        showError('定位失败，请点击地图选择位置')
      }
    },
    fail: () => {
      hideLoading()
      showError('定位失败，请点击地图选择位置')
    }
  })
}

// 地图长按事件
function onMapLongPress(e) {
  if (e.detail && e.detail.latitude) {
    mapLatitude.value = e.detail.latitude
    mapLongitude.value = e.detail.longitude
    locationSet.value = true
    isIPFallback.value = false
    catStore.setUserLocation({
      latitude: e.detail.latitude,
      longitude: e.detail.longitude
    })
    showSuccess('位置已更新')
    reverseGeocode(e.detail.latitude, e.detail.longitude)
  }
}

// 地图点击事件
function onMapTap(e) {
  if (e.detail && e.detail.latitude) {
    mapLatitude.value = e.detail.latitude
    mapLongitude.value = e.detail.longitude
    locationSet.value = true
    isIPFallback.value = false
    catStore.setUserLocation({
      latitude: e.detail.latitude,
      longitude: e.detail.longitude
    })
    reverseGeocode(e.detail.latitude, e.detail.longitude)
  }
}

// 标记点拖拽结束事件
function onMarkerDragEnd(e) {
  if (e.detail && e.detail.latitude) {
    mapLatitude.value = e.detail.latitude
    mapLongitude.value = e.detail.longitude
    locationSet.value = true
    isIPFallback.value = false
    catStore.setUserLocation({
      latitude: e.detail.latitude,
      longitude: e.detail.longitude
    })
    reverseGeocode(e.detail.latitude, e.detail.longitude)
  }
}

// Picker 事件
function onColorChange(e) {
  const idx = e.detail.value
  form.value.color = colorOptions[idx].value
}

function onBodyTypeChange(e) {
  const idx = e.detail.value
  form.value.bodyType = bodyTypeOptions[idx].value
}

// 选择照片
function choosePhotos() {
  const remaining = 9 - form.value.photos.length
  if (remaining <= 0) {
    showError('最多上传9张照片')
    return
  }
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      form.value.photos = form.value.photos.concat(res.tempFilePaths)
    }
  })
}

// 删除照片
function removePhoto(idx) {
  uni.showModal({
    title: '提示',
    content: '确定删除这张照片吗？',
    success: (res) => {
      if (res.confirm) {
        form.value.photos.splice(idx, 1)
      }
    }
  })
}

// 返回
function goBack() {
  uni.navigateBack({ delta: 1 })
}

// 提交
async function handleSubmit() {
  if (!form.value.nickname.trim()) {
    showError('请输入猫咪昵称')
    return
  }

  const address = form.value.location.trim()

  // 自动地理编码：如果用户输入了地址，但坐标是 IP 定位或未设置
  if (address && (isIPFallback.value || !locationSet.value)) {
    showLoading('正在解析地址...')
    const geocoded = await geocodeAddress(address)
    hideLoading()
    if (geocoded) {
      showSuccess('地址已解析为坐标')
      if (mapContext.value) {
        mapContext.value.moveToLocation({
          latitude: mapLatitude.value,
          longitude: mapLongitude.value
        })
      }
    } else {
      showError('地址解析失败，请尝试更详细的描述')
      return
    }
  }

  if (!locationSet.value) {
    showError('请先在地图上定位猫咪位置')
    return
  }

  if (!mapLatitude.value || !mapLongitude.value || mapLatitude.value === 0 || mapLongitude.value === 0) {
    showError('位置坐标无效，请重新定位')
    return
  }

  const features = form.value.features
    ? form.value.features.split(/\s+/).filter(Boolean)
    : []

  const statusMap = {
    healthy: 'healthy',
    minor: 'attention',
    serious: 'urgent'
  }
  const statusTextMap = {
    healthy: '健康',
    minor: '轻微伤病',
    serious: '重伤病'
  }

  console.log('新增猫咪提交数据:', JSON.stringify({
    name: form.value.nickname,
    latitude: mapLatitude.value,
    longitude: mapLongitude.value,
    location: form.value.location
  }))

  const catData = {
    name: form.value.nickname,
    color: form.value.color,
    bodyType: form.value.bodyType,
    gender: form.value.gender,
    personality: form.value.personality || (form.value.friendly === 'yes' ? '亲人' : ''),
    features,
    healthStatus: statusMap[form.value.healthStatus] || 'healthy',
    status: statusMap[form.value.healthStatus] || 'healthy',
    statusText: statusTextMap[form.value.healthStatus] || '健康',
    isSterilized: form.value.sterilized === 'yes',
    isPregnant: form.value.pregnant === 'yes',
    location: form.value.location,
    remark: form.value.remark,
    photos: form.value.photos,
    latitude: mapLatitude.value,
    longitude: mapLongitude.value,
    avatarType: 'real',
    feedingRecords: form.value.feedingRecords.map(record => ({
      id: 'feed_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      user: '当前用户',
      avatar: '',
      foodType: record.foodType,
      foodColor: record.foodColor,
      content: record.content || '已添加',
      time: record.time || getCurrentTimeStr()
    }))
  }

  // 名称重名校验：新增时检查全局，编辑时排除自身
  const excludeId = isEditMode.value ? editingCatId.value : null
  if (catStore.checkNameExist(catData.name, excludeId)) {
    showError('该猫咪名称已存在，请更换名称')
    return
  }

  if (isEditMode.value) {
    catStore.updateCat(editingCatId.value, catData)
    showSuccess('猫咪档案已更新')
    catStore.getCatById(editingCatId.value)
  } else {
    catStore.addCat(catData)
    showSuccess('猫咪档案已提交')
  }
  setTimeout(() => {
    uni.navigateBack({ delta: 1 })
  }, 1500)
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-add-cat {
  width: 100%;
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* ========== 自定义导航栏 ========== */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(180deg, rgba(250, 248, 245, 0.98) 0%, rgba(250, 248, 245, 0.92) 100%);
  backdrop-filter: blur(20rpx);

  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;
  }

  .nav-close {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .nav-close-icon {
      font-size: 36rpx;
      color: $text-secondary;
      font-weight: 500;
    }
  }

  .nav-title-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    .nav-title {
      font-size: $font-size-lg;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: 1rpx;
    }
  }

  .nav-spacer {
    width: 72rpx;
    height: 72rpx;
  }
}

/* ========== 滚动区域 ========== */
.main-scroll {
  flex: 1;
  height: 100vh;
}

.scroll-inner {
  padding-bottom: 20rpx;
}

/* ========== 通用 Section ========== */
.section {
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-color;
  box-shadow: $shadow-sm;
  margin: 24rpx 24rpx 0;
  padding: 32rpx;

  .section-title-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 28rpx;

    .section-icon {
      font-size: 34rpx;
    }

    .section-title {
      font-size: $font-size-base;
      font-weight: 700;
      color: $text-primary;
    }
  }
}

/* ========== Section A: 位置信息 ========== */
.map-preview {
  position: relative;
  width: 100%;
  height: 360rpx;
  border-radius: $radius-md;
  overflow: hidden;
  background-color: $color-neutral-100;

  .map-container {
    width: 100%;
    height: 100%;
  }

  .map-pin-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(255, 130, 16, 0.9);
    padding: 12rpx 24rpx;
    border-radius: $radius-md;

    .pin-hint-text {
      font-size: $font-size-sm;
      color: #fff;
    }
  }
}

.search-row {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;

  .search-input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 0 24rpx;
    height: 80rpx;
    background-color: $color-neutral-50;
    border-radius: $radius-full;
    border: 2rpx solid $border-color;

    .search-icon {
      font-size: 30rpx;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      font-size: $font-size-sm;
      color: $text-primary;
    }
  }

  .search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 32rpx;
    height: 80rpx;
    background-color: $brand-primary;
    border-radius: $radius-full;

    .search-btn-text {
      font-size: $font-size-sm;
      color: #fff;
      font-weight: 600;
    }
  }
}

.use-location-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: $brand-primary-light;
  border-radius: $radius-md;

  .location-icon {
    font-size: 28rpx;
    color: $brand-primary;
  }

  .location-text {
    font-size: $font-size-sm;
    color: $brand-primary;
    font-weight: 500;
  }
}

.location-info {
  display: flex;
  gap: 8rpx;
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;

  .location-label {
    font-size: $font-size-sm;
    color: $text-muted;
  }

  .location-value {
    flex: 1;
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: 500;
  }
}

.map-hint {
  display: block;
  margin-top: 12rpx;
  font-size: $font-size-xs;
  color: $text-muted;
  text-align: center;
}

/* ========== Section B: 猫咪信息 ========== */
.form-item {
  margin-bottom: 28rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: $font-size-sm;
  color: $text-secondary;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  font-size: $font-size-sm;
  color: $text-primary;
  box-sizing: border-box;
}

.input-placeholder {
  color: $text-muted;
  font-size: $font-size-sm;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 28rpx;
}

.form-picker {
  width: 100%;
}

.picker-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;

  .picker-text {
    font-size: $font-size-sm;
    color: $text-primary;

    &.placeholder {
      color: $text-muted;
    }
  }

  .picker-arrow {
    font-size: 20rpx;
    color: $text-muted;
    transform: scale(0.8);
  }
}

/* 胶囊按钮组 */
.pill-group {
  display: flex;
  gap: 16rpx;
}

.pill {
  height: 64rpx;
  padding: 0 32rpx;
  border-radius: $radius-full;
  background-color: $color-neutral-50;
  border: 2rpx solid $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  .pill-text {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: 500;
  }

  &.pill-active {
    background-color: $brand-primary-light;
    border-color: $brand-primary;

    .pill-text {
      color: $brand-primary;
      font-weight: 600;
    }
  }
}

/* ========== Section C: 状态信息 ========== */
.health-cards {
  display: flex;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.health-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 160rpx;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  background-color: $color-neutral-50;
  transition: all 0.2s;

  .health-icon {
    font-size: 48rpx;
    color: $text-muted;
  }

  .health-label {
    font-size: $font-size-xs;
    color: $text-muted;
    font-weight: 500;
  }

  &.health-healthy {
    &.health-selected {
      background-color: $state-success-light;
      border-color: $state-success;

      .health-icon,
      .health-label {
        color: $state-success;
      }
    }
  }

  &.health-minor {
    &.health-selected {
      background-color: $state-warning-light;
      border-color: $state-warning;

      .health-icon,
      .health-label {
        color: $state-warning;
      }
    }
  }

  &.health-serious {
    &.health-selected {
      background-color: $state-error-light;
      border-color: $state-error;

      .health-icon,
      .health-label {
        color: $state-error;
      }
    }
  }
}

/* ========== Section D: 照片上传 ========== */
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 240rpx;
  border: 4rpx dashed $border-color;
  border-radius: $radius-md;
  background-color: $color-neutral-50;

  .upload-icon-wrap {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background-color: $brand-primary-light;
    display: flex;
    align-items: center;
    justify-content: center;

    .upload-camera-icon {
      font-size: 40rpx;
    }
  }

  .upload-title {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: 500;
  }

  .upload-hint {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.thumbnail-row {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
  flex-wrap: wrap;
}

.thumbnail-box {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-md;
  background-color: $color-neutral-100;
  overflow: hidden;

  .thumbnail-image {
    width: 100%;
    height: 100%;
  }

  .thumbnail-delete {
    position: absolute;
    top: 0;
    right: 0;
    width: 40rpx;
    height: 40rpx;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom-left-radius: $radius-md;

    .delete-icon {
      font-size: 24rpx;
      color: #fff;
    }
  }

  &.thumbnail-add {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx dashed $border-color;
    background-color: $color-neutral-50;

    .thumbnail-plus-icon {
      font-size: 44rpx;
      color: $text-muted;
    }
  }
}

/* ========== Section E: 喂食选项 ========== */
.feeding-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.feeding-option {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-full;
  border: 2rpx solid $border-color;
  transition: all 0.2s ease;
}

.feeding-option.feeding-selected {
  border-color: $brand-primary;
  background-color: rgba($brand-primary, 0.1);
}

.feeding-option-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.feeding-option-label {
  font-size: $font-size-sm;
  color: $text-primary;
  font-weight: 500;
}

.feeding-option.feeding-selected .feeding-option-label {
  color: $brand-primary;
}

.feeding-option.feeding-info.feeding-selected {
  border-color: #1890ff;
  background-color: rgba(#1890ff, 0.1);
}

.feeding-option.feeding-info.feeding-selected .feeding-option-label {
  color: #1890ff;
}

.feeding-option.feeding-warning.feeding-selected {
  border-color: #faad14;
  background-color: rgba(#faad14, 0.1);
}

.feeding-option.feeding-warning.feeding-selected .feeding-option-label {
  color: #faad14;
}

.feeding-option.feeding-success.feeding-selected {
  border-color: #52c41a;
  background-color: rgba(#52c41a, 0.1);
}

.feeding-option.feeding-success.feeding-selected .feeding-option-label {
  color: #52c41a;
}

.feeding-option.feeding-purple.feeding-selected {
  border-color: #722ed1;
  background-color: rgba(#722ed1, 0.1);
}

.feeding-option.feeding-purple.feeding-selected .feeding-option-label {
  color: #722ed1;
}

.feeding-option.feeding-pink.feeding-selected {
  border-color: #eb2f96;
  background-color: rgba(#eb2f96, 0.1);
}

.feeding-option.feeding-pink.feeding-selected .feeding-option-label {
  color: #eb2f96;
}

.feeding-summary {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  background-color: rgba($brand-primary, 0.1);
  border-radius: $radius-md;
}

.feeding-summary-text {
  font-size: $font-size-xs;
  color: $brand-primary;
  font-weight: 500;
}

/* ========== 投喂记录详情 ========== */
.feeding-records-detail {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.feeding-record-item {
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  padding: 24rpx;
  border: 2rpx solid $border-color;
}

.feeding-record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid $border-color;
}

.feeding-record-food {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.feeding-record-icon {
  font-size: 36rpx;
}

.feeding-record-type {
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-primary;
}

.feeding-record-delete {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $color-neutral-100;
  border-radius: 50%;
}

.delete-icon-small {
  font-size: 24rpx;
  color: $text-muted;
}

.feeding-record-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.feeding-record-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.feeding-record-label {
  font-size: $font-size-sm;
  color: $text-muted;
  flex-shrink: 0;
}

.feeding-record-time-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background-color: #fff;
  border-radius: $radius-sm;
  border: 2rpx solid $border-color;
}

.feeding-record-time {
  font-size: $font-size-sm;
  color: $text-primary;
  font-weight: 500;
}

.picker-arrow-sm {
  font-size: 20rpx;
  color: $text-muted;
}

.feeding-record-input {
  flex: 1;
  margin-left: 16rpx;
  padding: 12rpx 16rpx;
  background-color: #fff;
  border-radius: $radius-sm;
  border: 2rpx solid $border-color;
  font-size: $font-size-sm;
  color: $text-primary;
  text-align: right;
}

/* ========== Section F: 备注 ========== */
.form-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx 24rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  font-size: $font-size-sm;
  color: $text-primary;
  line-height: 1.6;
  box-sizing: border-box;
}

/* ========== 底部按钮 ========== */
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(180deg, rgba(250, 248, 245, 0) 0%, rgba(250, 248, 245, 1) 20%);
  padding: 24rpx 32rpx 0;

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96rpx;
    background: linear-gradient(135deg, $color-primary-400 0%, $brand-primary 100%);
    border-radius: $radius-full;
    box-shadow: 0 8rpx 24rpx rgba(255, 130, 16, 0.4);

    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }

    .submit-btn-text {
      font-size: $font-size-base;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 2rpx;
    }
  }
}

/* ========== 底部占位 ========== */
.bottom-spacer {
  height: 200rpx;
}
</style>
