<template>
  <view class="page-index" :style="{ paddingTop: navHeight + 'px' }">
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-title">暖喵帮扶</text>
      </view>
    </view>

    <view class="search-bar">
      <view class="search-inner">
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input
            class="search-input"
            type="text"
            placeholder="搜索猫咪昵称、位置..."
            placeholder-class="search-placeholder"
            :value="searchKeyword"
            confirm-type="search"
            @confirm="onSearch"
            @input="onSearchInput"
          />
          <view
            v-if="searchKeyword"
            class="search-clear"
            @tap="clearSearch"
          >
            <text class="clear-icon">✕</text>
          </view>
        </view>
      </view>

      <scroll-view class="filter-chips" scroll-x :show-scrollbar="false">
        <view class="chips-inner">
          <view
            v-for="item in filterOptions"
            :key="item.value"
            class="chip"
            :class="{ active: activeFilter === item.value }"
            @tap="setFilter(item.value)"
          >
            <text class="chip-label">{{ item.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="map-section">
      <map
        id="catMap"
        class="map-container"
        :key="'map-' + currentRange + '-' + activeFilter + '-' + searchKeyword + '-' + catStore.catList.length"
        :latitude="latitude"
        :longitude="longitude"
        :scale="mapScale"
        :markers="allMarkers"
        :polyline="routePolyline"
        :show-location="true"
        enable-scroll
        enable-zoom
        @markertap="onMarkerTap"
        @tap="onMapTap"
        @initdone="onMapInitDone"
      >
      </map>

      <view class="range-selector">
        <view
          v-for="item in rangeOptions"
          :key="item.value"
          class="range-item"
          :class="{ active: currentRange === item.value }"
          @tap="setRange(item.value)"
        >
          <text class="range-text">{{ item.label }}</text>
        </view>
      </view>

      <view class="location-btn" @tap="relocate">
        <text class="location-icon">◎</text>
      </view>

      <view class="fab-btn" @tap="goToAddCat">
        <text class="fab-icon">+</text>
        <text class="fab-label">新增猫咪</text>
      </view>

      <!-- 上门喂猫入口按钮 -->
      <view class="home-visit-btn" @tap="goToHomeVisit">
        <text class="hv-icon">🐱</text>
        <text class="hv-label">上门喂猫</text>
      </view>

      <view v-if="selectedCat" class="route-info-bar" @tap="clearSelection">
        <view class="route-icon">
          <text class="route-icon-text">📍</text>
        </view>
        <view class="route-content">
          <text class="route-title">{{ selectedCat.name }}</text>
          <text class="route-distance">距您 {{ formatDistance(selectedCat.distance) }}</text>
        </view>
        <view class="route-close">
          <text class="route-close-icon">✕</text>
        </view>
      </view>

    </view>

    <view class="nearby-section">
      <view class="section-header">
        <view class="section-title-row">
          <text class="section-title">附近猫咪</text>
          <text class="section-count">{{ filteredNearbyCats.length }}只</text>
        </view>
      </view>

      <scroll-view v-if="filteredNearbyCats.length > 0" class="cat-scroll" scroll-x :show-scrollbar="false">
        <view class="cat-list">
          <NmCatCard
            v-for="cat in filteredNearbyCats"
            :key="cat.id"
            :cat="cat"
            :is-selected="cat.id === selectedCatId"
            @cattap="() => handleCatTap(cat)"
          />
        </view>
      </scroll-view>
      
      <view v-else class="empty-state">
        <text class="empty-icon">🐾</text>
        <text class="empty-text">该范围内暂无符合条件的猫咪</text>
        <text class="empty-hint">尝试调整筛选条件或扩大范围</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCatStore } from '@/store/cat'
import { getLocation, formatDistance } from '@/utils/location'
import { showLoading, hideLoading, showError } from '@/utils/toast'
import NmCatCard from '@/components/NmCatCard.vue'
import { getMarkerIcon as buildMarkerIcon } from '@/utils/marker'

const catStore = useCatStore()

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 44)

const latitude = ref(30.2741)
const longitude = ref(120.1551)
const mapScale = ref(15)
const currentRange = ref(0.5)
const selectedCatId = ref(null)

const searchKeyword = ref('')
const activeFilter = ref('all')

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '待投喂', value: 'need-feed' },
  { label: '待救助', value: 'need-rescue' },
  { label: '新发现', value: 'new-found' },
  { label: '最近更新', value: 'recent-update' }
]

const rangeOptions = [
  { label: '0.5km', value: 0.5 },
  { label: '1km', value: 1 },
  { label: '2km', value: 2 }
]

const filteredNearbyCats = computed(() => {
  const cats = [...catStore.filteredCats].sort((a, b) => (a.distance || 0) - (b.distance || 0))
  console.log('卡片列表:', cats.map(c => ({ name: c.name, distance: c.distance })))
  return cats
})

function getMarkerIcon(status, photoUrl, cat) {
  return buildMarkerIcon(status, photoUrl, cat)
}

function getMarkerBgColor(status) {
  const map = {
    healthy: '#e6f7ee',
    attention: '#fff3db',
    urgent: '#fde8e8',
    minor: '#fff3db',
    severe: '#fde8e8'
  }
  return map[status] || '#e6f7ee'
}

function getMarkerTextColor(status) {
  const map = {
    healthy: '#22a860',
    attention: '#e68a00',
    urgent: '#dc2626',
    minor: '#e68a00',
    severe: '#dc2626'
  }
  return map[status] || '#22a860'
}

const markers = computed(() => {
  return catStore.filteredCats.map(cat => {
    const photoUrl = cat.photos && cat.photos.length > 0 ? cat.photos[0] : ''
    return {
      id: Number(cat.id.replace('cat_', '')),
      latitude: cat.latitude,
      longitude: cat.longitude,
      title: cat.name,
      width: 36,
      height: 46,
      iconPath: getMarkerIcon(cat.status, photoUrl, cat),
      anchor: { x: 0.5, y: 1 },
      callout: {
        content: `${cat.name}  ${cat.statusText}  ${cat.distance !== undefined ? formatDistance(cat.distance) : ''}`,
        display: 'BYCLICK',
        borderRadius: 16,
        padding: 14,
        fontSize: 13,
        fontWeight: 'bold',
        bgColor: getMarkerBgColor(cat.status),
        color: getMarkerTextColor(cat.status),
        textAlign: 'center',
        borderWidth: 2,
        borderColor: getMarkerTextColor(cat.status)
      },
      _photo: photoUrl
    }
  })
})

const userMarker = computed(() => ({
  id: 99999,
  latitude: latitude.value,
  longitude: longitude.value,
  title: '我的位置',
  width: 32,
  height: 32,
  iconPath: buildMarkerIcon('user-location'),
  anchor: { x: 0.5, y: 0.5 }
}))

const allMarkers = computed(() => {
  return [...markers.value, userMarker.value]
})

const routePolyline = computed(() => {
  if (!selectedCatId.value) return []
  const cat = filteredCats.value.find(c => c.id === selectedCatId.value)
  if (!cat) return []
  return [{
    latitude: latitude.value,
    longitude: longitude.value
  }, {
    latitude: cat.latitude,
    longitude: cat.longitude
  }]
})

const selectedCat = computed(() => {
  if (!selectedCatId.value) return null
  return filteredCats.value.find(c => c.id === selectedCatId.value)
})

const filteredCats = computed(() => catStore.filteredCats)
const mapContext = ref(null)

function onMarkerTapById(catId) {
  console.log('[onMarkerTapById] START, catId:', catId)
  if (!catId) {
    console.error('[onMarkerTapById] catId is falsy!')
    showError('无法获取猫咪信息')
    return
  }
  const cat = catStore.getCatById(catId)
  console.log('[onMarkerTapById] getCatById result:', cat ? cat.name : 'null')
  if (!cat) {
    console.error('[onMarkerTapById] cat not found in catList! catList IDs:', catStore.catList?.map(c => c.id))
    showError('无法获取猫咪信息')
    return
  }
  catStore.setCurrentCat(cat)
  const url = '/pages/cat-profile/index?id=' + catId
  console.log('[onMarkerTapById] navigating to:', url)
  uni.navigateTo({ url: url })
}

const navHeight = computed(() => statusBarHeight.value + 44)

onMounted(() => {
  mapContext.value = uni.createMapContext('catMap')
  getLocation().then(loc => {
    console.log('[index] onMounted location:', loc.latitude, loc.longitude)
    latitude.value = loc.latitude
    longitude.value = loc.longitude
    catStore.setUserLocation(loc)
    catStore.initMockData()
    if (mapContext.value) {
      mapContext.value.moveToLocation({
        latitude: loc.latitude,
        longitude: loc.longitude
      })
    }
  }).catch(err => {
    console.warn('[index] onMounted getLocation failed:', err)
    catStore.initMockData()
  })
})

onShow(() => {
  console.log('[index] onShow - start')
  getLocation().then(loc => {
    console.log('[index] location obtained:', loc.latitude, loc.longitude)
    latitude.value = loc.latitude
    longitude.value = loc.longitude
    catStore.setUserLocation(loc)
    catStore.initMockData()
    if (mapContext.value) {
      mapContext.value.moveToLocation({
        latitude: loc.latitude,
        longitude: loc.longitude
      })
    }
    const cats = catStore.filteredCats
    console.log('[index] filteredCats count:', cats.length)
    cats.forEach(c => console.log('[index] cat:', c.id, c.name, 'distance:', c.distance, 'lat:', c.latitude, 'lng:', c.longitude))
  }).catch(err => {
    console.warn('[index] getLocation failed:', err)
    if (catStore.userLocation && catStore.userLocation.latitude !== 30.2741) {
      catStore.setUserLocation(catStore.userLocation)
    } else {
      catStore.initMockData()
    }
  })
})

function onSearchInput(e) {
  const kw = e.detail.value
  searchKeyword.value = kw
  catStore.setSearchKeyword(kw)
}

function onSearch(e) {
  const kw = (e.detail.value || '').trim()
  searchKeyword.value = kw
  catStore.setSearchKeyword(kw)
}

function clearSearch() {
  searchKeyword.value = ''
  catStore.setSearchKeyword('')
}

function setFilter(value) {
  activeFilter.value = value
  catStore.setFilter(value)
}

function setRange(value) {
  currentRange.value = value
  catStore.range = value
  const scaleMap = { 0.5: 15, 1: 14, 2: 13 }
  mapScale.value = scaleMap[value] || 14
  if (mapContext.value) {
    mapContext.value.moveToLocation({
      latitude: latitude.value,
      longitude: longitude.value
    })
  }
}

function relocate() {
  clearSelection()
  showLoading('定位中...')
  getLocation().then(loc => {
    console.log('[index] relocate location:', loc)
    latitude.value = loc.latitude
    longitude.value = loc.longitude
    catStore.setUserLocation(loc)
    catStore.initMockData()
    hideLoading()
    showSuccess('已定位')
    // 地图移动完全异步化，脱离 Promise 链
    // 避免 moveToLocation 的任何异常（同步/异步）触发 .catch 的 showError('定位失败')
    setTimeout(() => {
      if (mapContext.value) {
        try {
          const ret = mapContext.value.moveToLocation({
            latitude: loc.latitude,
            longitude: loc.longitude
          })
          // 若返回 Promise，捕获 rejection 防止 unhandled rejection
          if (ret && typeof ret.catch === 'function') {
            ret.catch(e => console.warn('[index] moveToLocation rejected:', e))
          }
        } catch (e) {
          console.warn('[index] moveToLocation failed:', e)
        }
      }
    }, 0)
  }).catch(err => {
    console.error('[index] relocate failed:', err)
    hideLoading()
    showError('定位失败')
  })
}

function onMarkerTap(e) {
  const markerId = e.detail?.markerId ?? e.markerId
  if (markerId === 99999) {
    clearSelection()
    return
  }
  const catId = 'cat_' + markerId
  const cat = catStore.getCatById(catId)
  if (!cat) {
    showError('无法获取猫咪信息')
    return
  }
  selectedCatId.value = catId
  catStore.setCurrentCat(cat)
  uni.navigateTo({ url: '/pages/cat-profile/index?id=' + catId })
}

function onMapTap() {
  clearSelection()
}

function clearSelection() {
  selectedCatId.value = null
}

function onMapInitDone() {
  if (mapContext.value) {
    mapContext.value.getCenterLocation({
      success: (res) => {
        if (res && res.latitude) {
          console.log('[map] getCenterLocation:', res.latitude, res.longitude)
          latitude.value = res.latitude
          longitude.value = res.longitude
          catStore.setUserLocation({
            latitude: res.latitude,
            longitude: res.longitude
          })
          catStore.initMockData()
        }
      },
      fail: (err) => {
        console.warn('[map] getCenterLocation failed:', err)
      }
    })
  }
}

function handleCatTap(cat) {
  console.log('[handleCatTap] START, received cat:', cat)
  console.log('[handleCatTap] cat.id:', cat?.id, 'cat.name:', cat?.name)
  console.log('[handleCatTap] catList.length:', catStore.catList?.length, 'nearbyCats.length:', catStore.nearbyCats?.length)
  
  if (!cat || !cat.id) {
    console.error('[handleCatTap] cat or cat.id is falsy! cat:', cat)
    showError('无法获取猫咪信息')
    return
  }
  
  // Debug: log all IDs in catList
  console.log('[handleCatTap] catList IDs:', catStore.catList?.map(c => c.id))
  
  let targetCat = catStore.getCatById(cat.id)
  console.log('[handleCatTap] getCatById result:', targetCat ? targetCat.name : 'null')
  
  if (!targetCat) {
    console.warn('[handleCatTap] getCatById FAILED! Falling back to passed cat. id:', cat.id)
    console.warn('[handleCatTap] nearbyCats IDs:', catStore.nearbyCats?.map(c => c.id))
    targetCat = cat
  }
  
  const url = '/pages/cat-profile/index?id=' + targetCat.id
  console.log('[handleCatTap] navigating to:', url, 'cat:', targetCat.name)
  
  selectedCatId.value = targetCat.id
  catStore.setCurrentCat(targetCat)
  uni.navigateTo({ url: url })
}

function goToAddCat() {
  uni.navigateTo({ url: '/pages/add-cat/index' })
}

// 跳转到上门喂猫列表页
function goToHomeVisit() {
  uni.navigateTo({ url: '/pages/home-visit/index' })
}

function goToProfile(cat) {
  console.log('[goToProfile] START, received cat:', cat)
  console.log('[goToProfile] cat.id:', cat?.id, 'cat.name:', cat?.name)
  
  if (!cat || !cat.id) {
    console.error('[goToProfile] cat or cat.id is falsy! cat:', cat)
    showError('无法获取猫咪信息')
    return
  }
  
  console.log('[goToProfile] catList IDs:', catStore.catList?.map(c => c.id))
  
  let targetCat = catStore.getCatById(cat.id)
  console.log('[goToProfile] getCatById result:', targetCat ? targetCat.name : 'null')
  
  if (!targetCat) {
    console.warn('[goToProfile] getCatById FAILED! Falling back to passed cat. id:', cat.id)
    targetCat = cat
  }
  
  const url = '/pages/cat-profile/index?id=' + targetCat.id
  console.log('[goToProfile] navigating to:', url, 'cat:', targetCat.name)
  
  catStore.setCurrentCat(targetCat)
  uni.navigateTo({ url: url })
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-index {
  width: 100%;
  min-height: 100vh;
  background-color: $bg-page;
  overflow: hidden;
  padding-bottom: calc(#{$tab-bar-height} + #{$safe-bottom});
  display: flex;
  flex-direction: column;
}

.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(180deg, rgba(250, 248, 245, 0.98) 0%, rgba(250, 248, 245, 0.9) 100%);
  backdrop-filter: blur(20rpx);

  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 32rpx;

    .nav-title {
      font-size: $font-size-xl;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: 2rpx;
    }
  }
}

.search-bar {
  position: relative;
  z-index: 10;
  background-color: $bg-page;
  padding: 16rpx 24rpx 0;

  .search-inner {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 16rpx;
  }

  .search-box {
    flex: 1;
    display: flex;
    align-items: center;
    height: 76rpx;
    background-color: $bg-card;
    border: 1rpx solid $border-color;
    border-radius: $radius-full;
    padding: 0 28rpx;
    gap: 16rpx;
    box-shadow: $shadow-sm;

    .search-icon { font-size: 28rpx; opacity: 0.5; }
    .search-input { flex: 1; height: 100%; font-size: $font-size-sm; color: $text-primary; line-height: 76rpx; }
    .search-clear {
      width: 36rpx; height: 36rpx; display: flex; align-items: center; justify-content: center;
      background-color: $color-neutral-300; border-radius: 50%;
      .clear-icon { font-size: 20rpx; color: #fff; line-height: 1; }
    }
  }
}

.search-placeholder { color: $text-muted; font-size: $font-size-sm; }

.filter-chips {
  white-space: nowrap;
  padding-bottom: 16rpx;
  .chips-inner { display: inline-flex; gap: 16rpx; padding-right: 24rpx; }
}

.chip {
  display: inline-flex; align-items: center; justify-content: center;
  height: 56rpx; padding: 0 28rpx; border-radius: $radius-full;
  background-color: $bg-card; border: 1rpx solid $border-color;
  transition: all 0.2s;

  &.active {
    background-color: $brand-primary;
    border-color: $brand-primary;
    box-shadow: 0 4rpx 12rpx rgba(255, 130, 16, 0.3);
    .chip-label { color: #fff; font-weight: 600; }
  }

  .chip-label { font-size: $font-size-sm; color: $text-muted; white-space: nowrap; }
}

.map-section {
  position: relative; width: 100%;
  height: calc(100vh - 640rpx - #{env(safe-area-inset-bottom)});
  min-height: 400rpx;
  z-index: 5;
  .map-container { width: 100%; height: 100%; }
}

.route-info-bar {
  position: absolute;
  bottom: 140rpx;
  left: 32rpx;
  right: 32rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: $shadow-md;
  z-index: 20;

  .route-icon {
    width: 64rpx;
    height: 64rpx;
    background-color: $brand-primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    .route-icon-text { font-size: 32rpx; }
  }
  .route-content {
    flex: 1;
    .route-title {
      display: block;
      font-size: $font-size-base;
      font-weight: 700;
      color: $text-primary;
      margin-bottom: 4rpx;
    }
    .route-distance {
      font-size: $font-size-sm;
      color: $brand-primary;
      font-weight: 500;
    }
  }
  .route-close {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $color-neutral-200;
    border-radius: 50%;
    .route-close-icon { font-size: 20rpx; color: $text-muted; }
  }
}

.range-selector {
  position: absolute; top: 24rpx; right: 24rpx;
  display: flex; flex-direction: column; gap: 6rpx;
  background-color: $bg-card; border-radius: $radius-lg; padding: 8rpx; box-shadow: $shadow-md;

  .range-item {
    width: 100rpx; height: 52rpx; display: flex; align-items: center; justify-content: center;
    border-radius: $radius-md; transition: all 0.2s;
    &.active { background-color: $brand-primary; .range-text { color: #fff; font-weight: 600; } }
    .range-text { font-size: $font-size-sm; color: $text-muted; }
  }
}

.location-btn {
  position: absolute; top: 24rpx; left: 24rpx;
  width: 80rpx; height: 80rpx; background-color: $bg-card; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: $shadow-md; transition: transform 0.2s;
  &:active { transform: scale(0.92); }
  .location-icon { font-size: 40rpx; color: $brand-primary; }
}

.fab-btn {
  position: absolute; bottom: 32rpx; right: 24rpx;
  display: flex; align-items: center; gap: 12rpx;
  background: linear-gradient(135deg, $color-primary-400 0%, $brand-primary 100%);
  padding: 20rpx 32rpx; border-radius: $radius-full;
  box-shadow: 0 8rpx 24rpx rgba(255, 130, 16, 0.35); z-index: 10;
  transition: transform 0.2s, box-shadow 0.2s;
  &:active { opacity: 0.9; transform: scale(0.96); }
  .fab-icon { font-size: 36rpx; color: #fff; font-weight: 700; line-height: 1; }
  .fab-label { font-size: $font-size-sm; color: #fff; font-weight: 600; white-space: nowrap; }
}

/* 上门喂猫入口按钮样式 */
.home-visit-btn {
  position: absolute;
  right: 24rpx;
  bottom: 280rpx; /* 在 fab-btn 上方，避开 route-info-bar */
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #FFFFFF;
  border: 2rpx solid #FF8210;
  border-radius: 999rpx;
  padding: 12rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.08);
  z-index: 10;
  transition: transform 0.2s;
  &:active { transform: scale(0.96); }
  .hv-icon { font-size: 32rpx; }
  .hv-label { font-size: 26rpx; color: #FF8210; font-weight: 500; white-space: nowrap; }
}

.nearby-section {
  background-color: $bg-page; padding: 24rpx 0 0;

  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32rpx; margin-bottom: 20rpx;
    .section-title-row { display: flex; align-items: baseline; gap: 12rpx; }
    .section-title { font-size: $font-size-lg; font-weight: 700; color: $text-primary; }
    .section-count { font-size: $font-size-sm; color: $text-muted; }
  }
}

.cat-scroll { white-space: nowrap; padding-bottom: 24rpx; }
.cat-list { display: inline-flex; gap: 20rpx; padding: 0 32rpx; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60rpx 32rpx; gap: 16rpx;
  .empty-icon { font-size: 80rpx; }
  .empty-text { font-size: $font-size-base; color: $text-primary; font-weight: 500; }
  .empty-hint { font-size: $font-size-sm; color: $text-muted; }
}
</style>