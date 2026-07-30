<template>
  <view class="page-feed-checkin">
    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-close" @tap="goBack">
          <text class="nav-close-icon">&#x2715;</text>
        </view>
        <view class="nav-title-area">
          <text class="nav-title">投喂打卡</text>
        </view>
        <view class="nav-spacer"></view>
      </view>
    </view>

    <!-- 主滚动区 -->
    <scroll-view class="main-scroll" scroll-y :show-scrollbar="false">
      <view class="scroll-inner" :style="{ paddingTop: navBarTotal + 'px' }">

        <!-- 猫咪信息（只读，从Store读取） -->
        <view class="section cat-info-section" v-if="cat">
          <view class="cat-info-row">
            <view class="cat-info-avatar" :style="{ backgroundColor: getAvatarColor(cat.name) }">
              <text class="cat-info-letter">{{ cat.name.charAt(0) }}</text>
            </view>
            <view class="cat-info-body">
              <text class="cat-info-name">{{ cat.name }}</text>
              <text class="cat-info-location">&#x1F4CD; {{ cat.location || '未知位置' }}</text>
            </view>
            <view class="cat-info-status" :class="'status-' + (cat.status || 'healthy')">
              <text class="cat-info-status-text">{{ cat.statusText || '健康' }}</text>
            </view>
          </view>
        </view>

        <!-- 投喂时间 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F552;</text>
            <text class="section-title">投喂时间</text>
          </view>

          <picker class="time-picker" mode="time" :value="form.time" @change="onTimeChange">
            <view class="time-display">
              <text class="time-label">今天</text>
              <text class="time-value">{{ form.time || formatCurrentTime() }}</text>
              <text class="time-arrow">&#x25B6;</text>
            </view>
          </picker>
        </view>

        <!-- 猫咪状态选择 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F4CB;</text>
            <text class="section-title">猫咪状态</text>
          </view>

          <view class="status-options">
            <view
              v-for="opt in statusOptions"
              :key="opt.value"
              :class="['status-option', 'status-opt-' + opt.value, { 'status-opt-selected': form.catStatus === opt.value }]"
              @tap="selectStatus(opt.value)"
            >
              <text class="status-opt-icon">{{ opt.icon }}</text>
              <text class="status-opt-label">{{ opt.label }}</text>
            </view>
          </view>
        </view>

        <!-- 投喂食物（含克重输入） -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F35C;</text>
            <text class="section-title">投喂食物</text>
          </view>

          <view class="food-list">
            <view
              v-for="food in foodOptions"
              :key="food.value"
              :class="['food-item', { 'food-selected': isFoodSelected(food.value) }]"
            >
              <view class="food-item-left" @tap="toggleFood(food.value)">
                <text class="food-icon">{{ food.icon }}</text>
                <text class="food-name">{{ food.label }}</text>
                <text class="food-check">{{ isFoodSelected(food.value) ? '&#x2713;' : '' }}</text>
              </view>
              <input
                v-if="isFoodSelected(food.value)"
                class="food-weight-input"
                type="text"
                :placeholder="'克重'"
                placeholder-class="weight-placeholder"
                :value="getFoodWeight(food.value)"
                @input="setFoodWeight(food.value, $event.detail.value)"
              />
            </view>
          </view>
        </view>

        <!-- 打卡备注 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F4AC;</text>
            <text class="section-title">打卡备注</text>
          </view>

          <!-- 快捷标签 -->
          <view class="quick-tags">
            <view
              v-for="tag in quickTagOptions"
              :key="tag"
              :class="['quick-tag', { 'quick-tag-active': form.quickTags.includes(tag) }]"
              @tap="toggleQuickTag(tag)"
            >
              <text class="quick-tag-text">{{ tag }}</text>
            </view>
          </view>

          <!-- 备注文本 -->
          <textarea
            class="form-textarea"
            v-model="form.remark"
            placeholder="补充备注信息..."
            placeholder-class="input-placeholder"
            :maxlength="500"
            :auto-height="true"
          />
        </view>

        <!-- 照片 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F4F7;</text>
            <text class="section-title">照片</text>
            <text class="section-count" v-if="form.photos.length">{{ form.photos.length }}/9</text>
          </view>

          <view class="photo-grid" v-if="form.photos.length">
            <view
              v-for="(photo, idx) in form.photos"
              :key="idx"
              class="photo-item"
            >
              <image class="photo-img" :src="photo" mode="aspectFill" @tap="previewPhoto(idx)" />
              <view class="photo-delete" @tap.stop="removePhoto(idx)">
                <text class="photo-delete-icon">&#x2715;</text>
              </view>
            </view>
          </view>

          <view
            v-if="form.photos.length < 9"
            class="upload-area"
            @tap="choosePhotos"
          >
            <view class="upload-icon-wrap">
              <text class="upload-camera-icon">&#x1F4F7;</text>
            </view>
            <text class="upload-title">添加照片</text>
          </view>
        </view>

        <!-- 位置定位 -->
        <view class="section">
          <view class="section-title-row">
            <text class="section-icon">&#x1F4CD;</text>
            <text class="section-title">投喂位置</text>
            <text class="section-count" v-if="addressVerified" style="color: #22A860;">&#x2713; 已验证</text>
          </view>

          <view class="location-btn-row">
            <view class="location-btn" @tap="useCurrentLocation">
              <text class="location-btn-icon">&#x1F4E2;</text>
              <text class="location-btn-text">使用当前位置</text>
            </view>
          </view>

          <!-- 地址输入 + 联想推荐 -->
          <view class="address-input-wrap">
            <input
              class="location-input"
              type="text"
              v-model="form.location"
              placeholder="或手动输入投喂位置（市/县/乡镇/村）"
              placeholder-class="input-placeholder"
              @input="onAddressInput"
              @blur="onAddressBlur"
              @confirm="onAddressConfirm"
            />
            <view
              v-if="suggestionList.length"
              class="suggestion-list"
            >
              <view
                v-for="(item, idx) in suggestionList"
                :key="idx"
                class="suggestion-item"
                @tap="selectSuggestion(item)"
              >
                <text class="suggestion-title">{{ item.title }}</text>
                <text class="suggestion-address">{{ item.address }}</text>
              </view>
            </view>
          </view>

          <!-- 地图预览（地址解析成功后显示） -->
          <view v-if="addressVerified && form.latitude && form.longitude" class="map-preview-wrap">
            <map
              class="map-preview"
              :latitude="form.latitude"
              :longitude="form.longitude"
              :scale="16"
              :markers="previewMarkers"
              @markerdragend="onPreviewMarkerDrag"
            />
            <text class="map-preview-hint">可拖动标记微调位置</text>
          </view>

          <!-- 提示文字 -->
          <text class="location-hint" v-if="form.location && !addressVerified" style="color: #E68A00;">地址待验证，点击校验或从下拉选择</text>
          <text class="location-hint location-hint-muted" v-if="!form.location">定位或手动输入后，将同步到猫咪档案</text>
        </view>

        <!-- 底部占位 -->
        <view class="bottom-spacer"></view>
      </view>
    </scroll-view>

    <!-- 固定底部按钮 -->
    <view class="bottom-action" :style="{ paddingBottom: 'calc(60rpx + ' + safeBottom + ')' }">
      <view class="submit-btn" @tap="handleSubmit">
        <text class="submit-btn-text">完成打卡</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useCatStore } from '@/store/cat'
import { CURRENT_USER } from '@/store/user'
import { TENCENT_MAP_API_BASE } from '@/utils/apiBase'
import { showSuccess, showError } from '@/utils/toast'
import { QQ_MAP_GL_KEY } from '@/config/keys'
import { getFoodColor } from '@/utils/format'
import { getLocation } from '@/utils/location'

const catStore = useCatStore()

// 系统信息
const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 44)
const safeBottom = sysInfo.safeAreaInsets?.bottom
  ? sysInfo.safeAreaInsets.bottom + 'px'
  : 'env(safe-area-inset-bottom)'

// 导航栏总高度
const navBarTotal = computed(() => statusBarHeight.value + 88)

// 猫咪状态选项
const statusOptions = [
  { value: 'healthy', label: '健康', icon: '\u2705' },
  { value: 'attention', label: '需关注', icon: '\u26A0\uFE0F' },
  { value: 'urgent', label: '紧急', icon: '\u2757' }
]

// 食物选项
const foodOptions = [
  { label: '猫粮', value: '猫粮', icon: '\uD83C\uDF72' },
  { label: '罐头', value: '罐头', icon: '\uD83E\uDD6B' },
  { label: '清水', value: '清水', icon: '\uD83D\uDCA7' },
  { label: '零食', value: '零食', icon: '\uD83C\uDF6A' },
  { label: '自制猫饭', value: '自制猫饭', icon: '\uD83C\uDF73' },
  { label: '其他', value: '其他', icon: '\u2795' }
]

// 快捷标签
const quickTagOptions = ['进食正常', '胃口好', '躲藏进食', '未进食', '其他异常']

// 头像颜色池
const avatarColors = ['#FF8210', '#22A860', '#3B82F6', '#E68A00', '#DC2626', '#8B5CF6', '#EC4899']

// 当前猫咪（从 Store 读取，只读展示）
const cat = ref(null)
const catId = ref('')

// 表单数据
const form = ref({
  time: '',
  foods: [],             // [{ value: '猫粮', weight: '50g' }, ...]
  quickTags: [],
  remark: '',
  photos: [],
  location: '',
  latitude: 0,
  longitude: 0,
  catStatus: 'healthy'
})

// 生成头像颜色
function getAvatarColor(name) {
  if (!name) return avatarColors[0]
  const idx = name.charCodeAt(0) % avatarColors.length
  return avatarColors[idx]
}

// 格式化当前时间
function formatCurrentTime() {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return h + ':' + m
}

// 时间选择
function onTimeChange(e) {
  form.value.time = e.detail.value
}

// ========== 食物选择 + 克重 ==========
function isFoodSelected(value) {
  return form.value.foods.some(f => f.value === value)
}

function getFoodWeight(value) {
  const found = form.value.foods.find(f => f.value === value)
  return found ? found.weight : ''
}

function setFoodWeight(value, weight) {
  const found = form.value.foods.find(f => f.value === value)
  if (found) {
    found.weight = weight
  }
}

function toggleFood(value) {
  const idx = form.value.foods.findIndex(f => f.value === value)
  if (idx > -1) {
    form.value.foods.splice(idx, 1)
  } else {
    form.value.foods.push({ value: value, weight: '' })
  }
}

// 状态选择
function selectStatus(value) {
  form.value.catStatus = value
}

// 快捷标签切换
function toggleQuickTag(tag) {
  const idx = form.value.quickTags.indexOf(tag)
  if (idx > -1) {
    form.value.quickTags.splice(idx, 1)
  } else {
    form.value.quickTags.push(tag)
  }
}

// ========== 照片 ==========
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

function removePhoto(idx) {
  form.value.photos.splice(idx, 1)
}

function previewPhoto(idx) {
  uni.previewImage({
    urls: form.value.photos,
    current: form.value.photos[idx]
  })
}

// ========== 位置定位 ==========
function useCurrentLocation() {
  uni.showLoading({ title: '定位中...', mask: true })
  getLocation().then(loc => {
    uni.hideLoading()
    form.value.latitude = loc.latitude
    form.value.longitude = loc.longitude
    addressVerified.value = true
    // 反向地理编码获取地址文字
    reverseGeocode(loc.latitude, loc.longitude).then(address => {
      if (address) {
        form.value.location = address
      }
    })
  }).catch(() => {
    uni.hideLoading()
    showError('定位失败，请手动输入位置')
  })
}

// 地址联想推荐
let suggestTimer = null
const suggestionList = ref([])
const addressVerified = ref(false)

// 预览地图标记
const previewMarkers = computed(() => {
  if (!form.value.latitude || !form.value.longitude) return []
  return [{
    id: 1,
    latitude: form.value.latitude,
    longitude: form.value.longitude,
    iconPath: '/static/marker-cat.png',
    width: 36,
    height: 36,
    draggable: true,
    anchor: { x: 0.5, y: 1 }
  }]
})

// 地址输入时联想推荐（防抖 300ms）
function onAddressInput(e) {
  const kw = e.detail.value
  form.value.location = kw
  addressVerified.value = false
  form.value.latitude = 0
  form.value.longitude = 0

  if (suggestTimer) clearTimeout(suggestTimer)
  if (!kw || kw.length < 2) {
    suggestionList.value = []
    return
  }

  suggestTimer = setTimeout(() => {
    fetchSuggestions(kw)
  }, 300)
}

// 调用腾讯地图 placeSuggestion API
function fetchSuggestions(keyword) {
  uni.request({
    url: TENCENT_MAP_API_BASE + '/place/v1/suggestion',
    data: {
      keyword: keyword,
      key: QQ_MAP_GL_KEY,
      region_fix: 0
    },
    method: 'GET',
    success: (res) => {
      const data = res.data
      if (data && data.status === 0 && data.data && data.data.length) {
        suggestionList.value = data.data.slice(0, 5).map(item => ({
          title: item.title,
          address: item.address,
          latitude: item.location.lat,
          longitude: item.location.lng
        }))
      } else {
        suggestionList.value = []
      }
    },
    fail: () => {
      suggestionList.value = []
    }
  })
}

// 选中联想项
function selectSuggestion(item) {
  form.value.location = item.title
  form.value.latitude = item.latitude
  form.value.longitude = item.longitude
  suggestionList.value = []
  addressVerified.value = true
}

// 失焦时校验地址
function onAddressBlur() {
  // 延迟执行，避免和选中联想项冲突
  setTimeout(() => {
    suggestionList.value = []
    if (form.value.location && !addressVerified.value) {
      geocodeAddress(form.value.location)
    }
  }, 200)
}

// 确认时校验地址
function onAddressConfirm() {
  if (form.value.location && !addressVerified.value) {
    geocodeAddress(form.value.location)
  }
}

// 地理编码：地址 → 经纬度
// 识别标准：地理编码能搜到有效 POI 点位即判定合法，不强制区级层级结构
// 兼容：地级市+区、地级市+县城+乡镇、县直管乡镇/村、省直辖县级市等
function geocodeAddress(address) {
  uni.showLoading({ title: '地址校验中...', mask: true })
  uni.request({
    url: TENCENT_MAP_API_BASE + '/geocoder/v1/',
    data: {
      address: address,
      key: QQ_MAP_GL_KEY
    },
    method: 'GET',
    success: (res) => {
      const data = res.data
      if (data && data.status === 0 && data.result && data.result.location) {
        uni.hideLoading()
        form.value.latitude = data.result.location.lat
        form.value.longitude = data.result.location.lng
        addressVerified.value = true
        uni.showToast({ title: '地址校验成功', icon: 'success' })
      } else {
        // 地理编码无结果，尝试 placeSuggestion 兜底（兼容乡镇/县城/村庄格式）
        fallbackSuggestion(address)
      }
    },
    fail: () => {
      uni.hideLoading()
      form.value.latitude = 0
      form.value.longitude = 0
      addressVerified.value = false
      uni.showToast({ title: '地址校验失败，请重试', icon: 'none' })
    }
  })
}

// placeSuggestion 兜底：geocoder 无法识别时，用 POI 搜索结果作为有效点位
// 只要能搜到有效 POI 即判定地址合法，不强制行政区划层级
function fallbackSuggestion(address) {
  uni.request({
    url: TENCENT_MAP_API_BASE + '/place/v1/suggestion',
    data: {
      keyword: address,
      key: QQ_MAP_GL_KEY,
      region_fix: 0
    },
    method: 'GET',
    success: (res) => {
      uni.hideLoading()
      const data = res.data
      if (data && data.status === 0 && data.data && data.data.length) {
        // 搜到有效 POI，判定地址合法
        const first = data.data[0]
        form.value.latitude = first.location.lat
        form.value.longitude = first.location.lng
        addressVerified.value = true
        uni.showToast({ title: '地址校验成功', icon: 'success' })
      } else {
        // 确实无法识别：纯模糊文字/虚构地点/无任何行政区划
        form.value.latitude = 0
        form.value.longitude = 0
        addressVerified.value = false
        uni.showModal({
          title: '地址无法识别',
          content: '地址识别失败，请填写包含【市/县/乡镇】的有效地点名称',
          showCancel: false
        })
      }
    },
    fail: () => {
      uni.hideLoading()
      form.value.latitude = 0
      form.value.longitude = 0
      addressVerified.value = false
      uni.showToast({ title: '地址校验失败，请重试', icon: 'none' })
    }
  })
}

// 拖拽预览标记
function onPreviewMarkerDrag(e) {
  form.value.latitude = e.detail.latitude
  form.value.longitude = e.detail.longitude
}

// 反向地理编码（经纬度 → 地址）
function reverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    uni.request({
      url: TENCENT_MAP_API_BASE + '/geocoder/v1/',
      data: {
        location: lat + ',' + lng,
        output: 'json',
        key: QQ_MAP_GL_KEY
      },
      method: 'GET',
      success: (res) => {
        const data = res.data
        if (data && data.status === 0 && data.result && data.result.address) {
          resolve(data.result.address)
        } else {
          resolve('')
        }
      },
      fail: () => { resolve('') }
    })
  })
}

// 返回
function goBack() {
  uni.navigateBack({ delta: 1 })
}

// 提交
function handleSubmit() {
  if (!catId.value || !cat.value) {
    showError('猫咪信息缺失')
    return
  }
  if (!form.value.foods.length) {
    showError('请选择投喂食物')
    return
  }

  // 地址校验：手动输入地址但未解析成功时拦截
  if (form.value.location && !addressVerified.value) {
    showError('地址未验证，请从下拉选择或重新校验')
    return
  }

  const timeStr = form.value.time || formatCurrentTime()
  const now = new Date()
  const dateStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0')

  // 构建食物描述（含克重）
  const foodTypeStr = form.value.foods.map(f => {
    return f.value + (f.weight ? ' ' + f.weight : '')
  }).join('、')

  // 构建备注内容
  const contentParts = []
  if (form.value.quickTags.length) contentParts.push(form.value.quickTags.join('、'))
  if (form.value.remark) contentParts.push(form.value.remark)
  const contentStr = contentParts.join(' | ')

  // 构建提交记录
  const record = {
    foodType: foodTypeStr,
    foodColor: getFoodColor(form.value.foods[0].value) || 'primary',
    foodWeight: form.value.foods.map(f => f.weight).filter(Boolean).join('、'),
    time: dateStr + ' ' + timeStr,
    user: CURRENT_USER.name,
    avatar: '',
    content: contentStr,
    photos: form.value.photos,
    location: form.value.location,
    latitude: form.value.latitude,
    longitude: form.value.longitude,
    catStatus: form.value.catStatus
  }

  catStore.addFeedingRecord(catId.value, record)
  showSuccess('打卡成功')
  setTimeout(() => {
    uni.navigateBack({ delta: 1 })
  }, 1500)
}

// ========== 生命周期 ==========
onLoad((options) => {
  if (!options || !options.id) {
    showError('猫咪信息缺失')
    setTimeout(() => { uni.navigateBack({ delta: 1 }) }, 1500)
    return
  }
  catId.value = options.id
  if (!catStore.catList.length) {
    catStore.initMockData()
  }
  const found = catStore.getCatById(catId.value)
  if (!found) {
    showError('未找到猫咪信息')
    setTimeout(() => { uni.navigateBack({ delta: 1 }) }, 1500)
    return
  }
  cat.value = found
  // 初始化状态选择为猫咪当前状态
  form.value.catStatus = found.status || 'healthy'
})

onUnload(() => {
  // 清理本页面临时数据
  cat.value = null
})
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-feed-checkin {
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

    .section-count {
      font-size: $font-size-xs;
      color: $text-muted;
      margin-left: auto;
    }
  }
}

/* ========== 猫咪信息 ========== */
.cat-info-section {
  .cat-info-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .cat-info-avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .cat-info-letter {
      font-size: $font-size-lg;
      color: #ffffff;
      font-weight: 700;
    }
  }

  .cat-info-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6rpx;

    .cat-info-name {
      font-size: $font-size-base;
      font-weight: 700;
      color: $text-primary;
    }

    .cat-info-location {
      font-size: $font-size-xs;
      color: $text-muted;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .cat-info-status {
    height: 44rpx;
    padding: 0 20rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.status-healthy {
      background-color: $state-success-light;
      .cat-info-status-text { color: $state-success; }
    }
    &.status-attention {
      background-color: $state-warning-light;
      .cat-info-status-text { color: $state-warning; }
    }
    &.status-urgent {
      background-color: $state-error-light;
      .cat-info-status-text { color: $state-error; }
    }

    .cat-info-status-text {
      font-size: 24rpx;
      font-weight: 600;
    }
  }
}

/* ========== 投喂时间 ========== */
.time-picker {
  width: 100%;
}

.time-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;

  .time-label {
    font-size: $font-size-sm;
    color: $text-muted;
  }

  .time-value {
    font-size: $font-size-base;
    color: $text-primary;
    font-weight: 600;
  }

  .time-arrow {
    font-size: 22rpx;
    color: $text-muted;
  }
}

/* ========== 猫咪状态选择 ========== */
.status-options {
  display: flex;
  gap: 16rpx;
}

.status-option {
  flex: 1;
  height: 96rpx;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  background-color: $color-neutral-50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  transition: all 0.2s;

  .status-opt-icon {
    font-size: 32rpx;
  }

  .status-opt-label {
    font-size: $font-size-xs;
    color: $text-secondary;
    font-weight: 500;
  }

  &.status-opt-selected {
    border-width: 3rpx;

    .status-opt-label {
      font-weight: 700;
    }
  }

  &.status-opt-healthy.status-opt-selected {
    background-color: $state-success-light;
    border-color: $state-success;
    .status-opt-label { color: $state-success; }
  }

  &.status-opt-attention.status-opt-selected {
    background-color: $state-warning-light;
    border-color: $state-warning;
    .status-opt-label { color: $state-warning; }
  }

  &.status-opt-urgent.status-opt-selected {
    background-color: $state-error-light;
    border-color: $state-error;
    .status-opt-label { color: $state-error; }
  }
}

/* ========== 投喂食物（含克重） ========== */
.food-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.food-item {
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  background-color: $color-neutral-50;
  overflow: hidden;
  transition: all 0.2s;

  &.food-selected {
    background-color: $brand-primary-light;
    border-color: $brand-primary;
  }

  .food-item-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 24rpx;

    .food-icon {
      font-size: 40rpx;
    }

    .food-name {
      flex: 1;
      font-size: $font-size-sm;
      color: $text-secondary;
      font-weight: 500;
    }

    .food-check {
      font-size: 32rpx;
      color: $brand-primary;
      font-weight: 700;
    }
  }

  .food-weight-input {
    padding: 16rpx 24rpx;
    background-color: rgba(255, 255, 255, 0.6);
    border-top: 2rpx solid $border-color;
    font-size: $font-size-sm;
    color: $text-primary;
  }
}

.weight-placeholder {
  color: $text-muted;
  font-size: $font-size-sm;
}

/* ========== 打卡备注 ========== */
.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.quick-tag {
  height: 60rpx;
  padding: 0 24rpx;
  border-radius: $radius-full;
  background-color: $color-neutral-50;
  border: 2rpx solid $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  .quick-tag-text {
    font-size: $font-size-xs;
    color: $text-secondary;
    font-weight: 500;
  }

  &.quick-tag-active {
    background-color: $brand-primary-light;
    border-color: $brand-primary;

    .quick-tag-text {
      color: $brand-primary;
      font-weight: 600;
    }
  }
}

.form-textarea {
  width: 100%;
  min-height: 140rpx;
  padding: 20rpx 24rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  font-size: $font-size-sm;
  color: $text-primary;
  line-height: 1.6;
  box-sizing: border-box;
}

.input-placeholder {
  color: $text-muted;
  font-size: $font-size-sm;
}

/* ========== 照片 ========== */
.photo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.photo-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: $radius-md;
  overflow: hidden;

  .photo-img {
    width: 100%;
    height: 100%;
  }

  .photo-delete {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;

    .photo-delete-icon {
      font-size: 24rpx;
      color: #fff;
    }
  }
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 200rpx;
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
}

/* ========== 位置定位 ========== */
.location-btn-row {
  margin-bottom: 20rpx;
}

.location-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 80rpx;
  background-color: $brand-primary-light;
  border-radius: $radius-md;
  border: 2rpx solid $brand-primary;

  .location-btn-icon {
    font-size: 32rpx;
  }

  .location-btn-text {
    font-size: $font-size-sm;
    color: $brand-primary;
    font-weight: 600;
  }

  &:active {
    opacity: 0.8;
  }
}

/* 地址输入 + 联想 */
.address-input-wrap {
  position: relative;
}

.suggestion-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: #fff;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  max-height: 400rpx;
  overflow-y: auto;

  .suggestion-item {
    padding: 20rpx 24rpx;
    border-bottom: 2rpx solid $color-neutral-50;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: $color-neutral-50;
    }

    .suggestion-title {
      display: block;
      font-size: $font-size-sm;
      color: $text-primary;
      font-weight: 500;
    }

    .suggestion-address {
      display: block;
      font-size: $font-size-xs;
      color: $text-muted;
      margin-top: 4rpx;
    }
  }
}

/* 地图预览 */
.map-preview-wrap {
  margin-top: 20rpx;

  .map-preview {
    width: 100%;
    height: 320rpx;
    border-radius: $radius-md;
    border: 2rpx solid $border-color;
  }

  .map-preview-hint {
    display: block;
    font-size: $font-size-xs;
    color: $text-muted;
    text-align: center;
    margin-top: 8rpx;
  }
}

.location-input {
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

.location-hint {
  display: block;
  font-size: $font-size-xs;
  color: $text-secondary;
  margin-top: 12rpx;

  &.location-hint-muted {
    color: $text-muted;
  }
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
