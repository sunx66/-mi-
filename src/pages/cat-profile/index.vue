<template>
  <view class="page-cat-profile">
    <!-- DEBUG: show when cat data is null -->
    <view v-if="!cat" class="debug-panel">
      <text class="debug-title">⚠️ 猫咪数据加载失败</text>
      <text class="debug-hint">请返回首页重新点击猫咪卡片</text>
      <text class="debug-id">当前ID: {{ catId || '无' }}</text>
      <text class="debug-store-count">Store猫咪数: {{ catStore.catList?.length || 0 }}</text>
      <view class="debug-btn" @tap="goBack">
        <text class="debug-btn-text">返回首页</text>
      </view>
    </view>

    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-btn" @tap="goBack">
          <text class="nav-icon">&#x2190;</text>
        </view>
        <view class="nav-title-area">
          <text class="nav-title">{{ cat?.name || '猫咪档案' }}</text>
        </view>
        <view class="nav-spacer"></view>
      </view>
    </view>

    <scroll-view class="main-scroll" scroll-y :show-scrollbar="false">
      <!-- 顶部照片/头像区 -->
      <view class="hero-section">
        <view class="hero-bg"></view>

        <view class="hero-avatar" @tap="handleAvatarTap">
          <image
            v-if="cat?.photos && cat.photos.length"
            class="avatar-img"
            :src="cat.photos[0]"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="avatar-emoji">&#x1F408;</text>
            <text class="avatar-hint">点击上传</text>
          </view>
          <view v-if="cat?.photos && cat.photos.length" class="avatar-count-badge">
            <text class="avatar-count-text">{{ cat.photos.length }}</text>
          </view>
        </view>

        <view class="hero-name-row">
          <text class="hero-name">{{ cat?.name || '未命名' }}</text>
          <view class="hero-status-badge" :class="'badge-' + (cat?.status || 'healthy')">
            <text class="hero-status-text">{{ cat?.statusText || '未知' }}</text>
          </view>
        </view>

        <view class="hero-meta">
          <view class="hero-meta-item">
            <text class="hero-meta-icon">&#x25CB;</text>
            <text class="hero-meta-text">{{ cat?.location || '未知位置' }}</text>
          </view>
          <view class="hero-meta-item">
            <text class="hero-meta-icon">&#x1F554;</text>
            <text class="hero-meta-text">最后更新 {{ cat?.lastUpdate || '-' }}</text>
          </view>
        </view>
      </view>

      <!-- 基本信息卡片 -->
      <view class="card info-card">
        <view class="card-header">
          <text class="card-title">基本信息</text>

        </view>

        <view class="info-grid">
          <view class="info-cell">
            <text class="info-label">毛色</text>
            <text class="info-value">{{ cat?.color || '-' }}</text>
          </view>
          <view class="info-cell">
            <text class="info-label">体型</text>
            <text class="info-value">{{ cat?.bodyType || '-' }}</text>
          </view>
          <view class="info-cell">
            <text class="info-label">性别</text>
            <text class="info-value">{{ genderText }}</text>
          </view>
          <view class="info-cell">
            <text class="info-label">性格</text>
            <text class="info-value">{{ cat?.personality || '-' }}</text>
          </view>
        </view>

        <view class="features-row" v-if="cat?.features?.length">
          <view
            v-for="(feature, idx) in cat.features"
            :key="idx"
            class="feature-tag"
          >
            <text class="feature-text">{{ feature }}</text>
          </view>
        </view>

        <view class="location-row" v-if="cat?.location">
          <view class="location-icon-wrap">
            <text class="location-icon">&#x1F4CD;</text>
          </view>
          <view class="location-body" @tap="openNavFromCat">
            <text class="location-label">出没地点</text>
            <text class="location-address location-clickable">{{ cat.location }}</text>
          </view>
          <view class="location-nav-btn" @tap="openNavFromCat">
            <text class="location-nav-text">导航</text>
          </view>
        </view>
      </view>

      <!-- 健康状态卡片 -->
      <view class="card health-card">
        <view class="card-header">
          <text class="card-title">健康状态</text>
        </view>

        <view class="health-grid">
          <view class="health-item">
            <view class="health-icon" :class="cat?.isSterilized ? 'icon-success' : 'icon-muted'">
              <text class="health-icon-text">{{ cat?.isSterilized ? '\u2713' : '\u25CB' }}</text>
            </view>
            <text class="health-name">绝育</text>
            <text
              class="health-value"
              :class="cat?.isSterilized ? 'text-success' : 'text-muted'"
            >
              {{ cat?.isSterilized ? '已绝育' : '未绝育' }}
            </text>
          </view>

          <view class="health-item">
            <view class="health-icon" :class="'icon-' + healthClass">
              <text class="health-icon-text">{{ healthIcon }}</text>
            </view>
            <text class="health-name">健康</text>
            <text class="health-value" :class="'text-' + healthClass">
              {{ cat?.statusText || '-' }}
            </text>
          </view>

          <view class="health-item">
            <view class="health-icon" :class="cat?.isPregnant ? 'icon-warning' : 'icon-info'">
              <text class="health-icon-text">{{ cat?.isPregnant ? '\u2713' : '\u25CB' }}</text>
            </view>
            <text class="health-name">怀孕</text>
            <text
              class="health-value"
              :class="cat?.isPregnant ? 'text-warning' : 'text-info'"
            >
              {{ cat?.isPregnant ? '怀孕中' : '未怀孕' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 投喂记录 -->
      <view class="card feeding-card">
        <view class="card-header">
          <text class="card-title">投喂记录</text>
          <text class="card-count">{{ cat?.feedingRecords?.length || 0 }} 条</text>
        </view>

        <view v-if="cat?.feedingRecords?.length" class="feeding-list">
          <view
            v-for="record in cat.feedingRecords"
            :key="record.id"
            class="feeding-item"
          >
            <view class="feeding-avatar">
              <text class="feeding-avatar-text">{{ (record.user || '?').charAt(0) }}</text>
            </view>
            <view class="feeding-body">
              <view class="feeding-top">
                <text class="feeding-user">{{ record.user }}</text>
                <text class="feeding-time">{{ record.time }}</text>
              </view>
              <view class="feeding-bottom">
                <view
                  class="food-chip"
                  :class="'chip-' + (record.foodColor || 'default')"
                >
                  <text class="food-chip-text">{{ record.foodType }}</text>
                </view>
                <text class="feeding-content">{{ record.content }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="empty-state">
          <text class="empty-emoji">&#x1F4ED;</text>
          <text class="empty-title">暂无投喂记录</text>
          <text class="empty-desc">点击下方"投喂打卡"开始记录</text>
        </view>
      </view>

      <!-- 状态变化时间线 -->
      <view class="card timeline-card">
        <view class="card-header">
          <text class="card-title">状态变化</text>
        </view>

        <view v-if="cat?.statusTimeline?.length" class="timeline-list">
          <view
            v-for="(item, idx) in cat.statusTimeline"
            :key="idx"
            class="timeline-item"
          >
            <view class="timeline-axis">
              <view class="timeline-dot" :class="{ 'dot-first': idx === 0 }"></view>
              <view
                v-if="idx < cat.statusTimeline.length - 1"
                class="timeline-line"
              ></view>
            </view>
            <view class="timeline-body">
              <text class="timeline-content">{{ item.content }}</text>
              <!-- 照片缩略图 -->
              <view v-if="item.photos && item.photos.length" class="timeline-photos">
                <image
                  v-for="(photo, pIdx) in item.photos"
                  :key="pIdx"
                  class="timeline-photo"
                  :src="photo"
                  mode="aspectFill"
                  @tap="previewTimelinePhoto(item.photos, pIdx)"
                />
              </view>
              <!-- 位置信息 -->
              <view v-if="item.location" class="timeline-location" @tap="openNavFromTimelineItem(item)">
                <text class="timeline-location-icon">&#x1F4CD;</text>
                <text class="timeline-location-text location-clickable">{{ item.location }}</text>
              </view>
              <view class="timeline-meta">
                <text class="timeline-user">{{ item.user }}</text>
                <text class="timeline-dot-sep">·</text>
                <text class="timeline-time">{{ item.time }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="empty-state">
          <text class="empty-emoji">&#x1F4CB;</text>
          <text class="empty-title">暂无状态记录</text>
          <text class="empty-desc">记录猫咪的成长轨迹</text>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view
      class="bottom-action"
      :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + ')' }"
    >
      <view class="feed-checkin-btn" @tap="goFeedCheckin">
        <text class="feed-checkin-icon">+</text>
        <text class="feed-checkin-text">投喂打卡</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useCatStore } from '@/store/cat'
import { getGenderText } from '@/utils/format'
import { showError } from '@/utils/toast'
import { openExternalNavigation } from '@/utils/mapNav'

const catStore = useCatStore()

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 44)
const safeBottom = sysInfo.safeAreaInsets?.bottom
  ? sysInfo.safeAreaInsets.bottom + 'px'
  : 'env(safe-area-inset-bottom)'

const catId = ref('')
const cat = ref(null)

const genderText = computed(() => {
  if (!cat.value) return '-'
  return getGenderText(cat.value.gender)
})

const healthClass = computed(() => {
  const status = cat.value?.status
  if (status === 'healthy') return 'success'
  if (status === 'attention') return 'warning'
  if (status === 'urgent') return 'error'
  return 'info'
})

const healthIcon = computed(() => {
  const status = cat.value?.status
  if (status === 'healthy') return '✓'
  if (status === 'attention') return '⚠'
  if (status === 'urgent') return '⚠'
  return '○'
})

// 统一数据加载：从 Store 按 ID 读取（唯一数据源）
function loadData() {
  if (!catId.value) {
    // 尝试从 URL 参数获取 ID
    try {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const pageOptions = currentPage?.$page?.options || currentPage?.options
      if (pageOptions?.id) {
        catId.value = pageOptions.id
      }
    } catch (e) {
      console.warn('[cat-profile] get page options failed:', e.message)
    }
  }

  if (!catId.value) {
    console.warn('[cat-profile] no catId')
    cat.value = null
    return
  }

  // 确保 Store 已初始化
  if (!catStore.catList.length) {
    catStore.initMockData()
  }

  const found = catStore.getCatById(catId.value)
  if (found) {
    cat.value = found
  } else {
    console.warn('[cat-profile] cat not found in store:', catId.value)
    cat.value = null
  }
}

onLoad((options) => {
  if (options && options.id) {
    catId.value = options.id
  }
  loadData()
})

onShow(() => {
  // 每次显示页面时从 Store 重新读取，确保数据同步
  loadData()
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function handleAvatarTap() {
  if (!cat.value?.photos?.length) return

  uni.previewImage({
    urls: cat.value.photos,
    current: cat.value.photos[0]
  })
}

// 从猫咪主体位置导航
function openNavFromCat() {
  if (cat.value && cat.value.latitude && cat.value.longitude) {
    openExternalNavigation(cat.value.latitude, cat.value.longitude, cat.value.name + '的位置')
  } else {
    showError('暂无坐标信息')
  }
}

// 从时间线条目导航（优先用猫咪主体坐标，条目坐标作为补充）
function openNavFromTimelineItem(item) {
  const lat = item.latitude || (cat.value && cat.value.latitude)
  const lng = item.longitude || (cat.value && cat.value.longitude)
  if (lat && lng) {
    openExternalNavigation(lat, lng, item.location || (cat.value && cat.value.name + '的位置'))
  } else {
    showError('暂无坐标信息')
  }
}

function navigateToCat() {
  if (!cat.value) return
  // #ifdef MP-WEIXIN
  uni.openLocation({
    latitude: cat.value.latitude,
    longitude: cat.value.longitude,
    name: cat.value.name,
    address: cat.value.location
  })
  // #endif
}

// 预览时间线照片
function previewTimelinePhoto(photos, idx) {
  uni.previewImage({
    urls: photos,
    current: photos[idx]
  })
}

function goFeedCheckin() {
  if (catId.value) {
    uni.navigateTo({ url: '/pages/feed-checkin/index?id=' + catId.value })
  } else {
    showError('无法获取猫咪信息')
  }

}
</script>




<style lang="scss">
@import '@/styles/variables.scss';

.page-cat-profile {
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
  background: linear-gradient(180deg, rgba(250, 248, 245, 0.95) 0%, rgba(250, 248, 245, 0.75) 100%);
  backdrop-filter: blur(20rpx);

  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;
  }


  .nav-btn {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .nav-icon {
      font-size: 40rpx;
      color: $text-primary;
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
      max-width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

}

/* ========== 主滚动区 ========== */
.main-scroll {
  flex: 1;
  height: 100vh;
  padding-bottom: 200rpx;
}

/* ========== 顶部 Hero 区 ========== */
.hero-section {
  position: relative;
  padding: 120rpx 32rpx 32rpx;
  background-color: $color-neutral-50;

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 360rpx;
    background: linear-gradient(135deg, $color-primary-50 0%, $color-primary-100 100%);
    z-index: 0;
    border-bottom-left-radius: 48rpx;
    border-bottom-right-radius: 48rpx;
  }


  > view {
    position: relative;
    z-index: 1;
  }

}

.hero-avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  overflow: visible;
  margin: 0 auto 24rpx;
  background: #fff;
  box-shadow: $shadow-md;
  position: relative;
  border: 6rpx solid #fff;

  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }


  .avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $color-primary-50 0%, $color-primary-100 100%);
    gap: 6rpx;

    .avatar-emoji {
      font-size: 80rpx;
      line-height: 1;
    }

    .avatar-hint {
      font-size: 20rpx;
      color: $brand-primary;
      font-weight: 500;
    }
  }


  .avatar-count-badge {
    position: absolute;
    right: -4rpx;
    bottom: -4rpx;
    min-width: 44rpx;
    height: 44rpx;
    padding: 0 12rpx;
    background-color: $brand-primary;
    border: 4rpx solid #fff;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;

    .avatar-count-text {
      font-size: 20rpx;
      color: #fff;
      font-weight: 700;
    }
  }

}

.hero-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 16rpx;

  .hero-name {
    font-size: 44rpx;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 1rpx;
  }


  .hero-status-badge {
    height: 44rpx;
    padding: 0 20rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;

    &.badge-healthy {
      background-color: $state-success-light;
      .hero-status-text { color: $state-success; }
    }
    &.badge-attention {
      background-color: $state-warning-light;
      .hero-status-text { color: $state-warning; }
    }
    &.badge-urgent {
      background-color: $state-error-light;
      .hero-status-text { color: $state-error; }
    }

    .hero-status-text {
      font-size: 24rpx;
      font-weight: 600;
    }
  }

}

.hero-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;

  .hero-meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;

    .hero-meta-icon {
      font-size: 24rpx;
      color: $text-muted;
    }

    .hero-meta-text {
      font-size: 24rpx;
      color: $text-muted;
      max-width: 320rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

}

/* ========== 卡片通用 ========== */
.card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-color;
  box-shadow: $shadow-sm;
  margin: 0 24rpx 24rpx;
  padding: 32rpx;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;

  .card-title {
    font-size: $font-size-base;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 1rpx;
  }


  .card-count {
    font-size: $font-size-xs;
    color: $text-muted;
    font-weight: 500;
  }


}

/* ========== 基本信息卡片 ========== */
.info-card {
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24rpx 32rpx;
    margin-bottom: 28rpx;

    .info-cell {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .info-label {
        font-size: $font-size-xs;
        color: $text-muted;
      }

      .info-value {
        font-size: $font-size-base;
        color: $text-primary;
        font-weight: 600;
      }
    }
  }

}

.features-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 28rpx;

  .feature-tag {
    height: 48rpx;
    padding: 0 24rpx;
    background-color: $brand-primary-light;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;

    .feature-text {
      font-size: $font-size-sm;
      color: $brand-primary;
      font-weight: 500;
    }
  }

}

.location-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 24rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;

  .location-icon-wrap {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background-color: $brand-primary-light;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .location-icon {
      font-size: 28rpx;
    }
  }


  .location-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .location-label {
      font-size: $font-size-xs;
      color: $text-muted;
    }

    .location-address {
      font-size: $font-size-sm;
      color: $text-primary;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }


  .location-nav-btn {
    height: 52rpx;
    padding: 0 24rpx;
    background-color: $brand-primary;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .location-nav-text {
      font-size: $font-size-sm;
      color: #fff;
      font-weight: 500;
    }
  }

}

/* ========== 健康状态卡片 ========== */
.health-card {
  .health-grid {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
  }


  .health-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 16rpx 8rpx;

    .health-icon {
      width: 96rpx;
      height: 96rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.icon-success {
        background-color: $state-success-light;
        .health-icon-text { color: $state-success; }
      }
      &.icon-warning {
        background-color: $state-warning-light;
        .health-icon-text { color: $state-warning; }
      }
      &.icon-error {
        background-color: $state-error-light;
        .health-icon-text { color: $state-error; }
      }
      &.icon-info {
        background-color: $state-info-light;
        .health-icon-text { color: $state-info; }
      }
      &.icon-muted {
        background-color: $color-neutral-100;
        .health-icon-text { color: $text-muted; }
      }

      .health-icon-text {
        font-size: 40rpx;
        font-weight: 700;
      }
    }

    .health-name {
      font-size: $font-size-xs;
      color: $text-muted;
    }

    .health-value {
      font-size: $font-size-sm;
      font-weight: 600;

      &.text-success { color: $state-success; }
      &.text-warning { color: $state-warning; }
      &.text-error { color: $state-error; }
      &.text-info { color: $state-info; }
      &.text-muted { color: $text-muted; }
    }
  }

}

/* ========== 投喂记录 ========== */
.feeding-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;

  .feeding-item {
    display: flex;
    gap: 20rpx;

    .feeding-avatar {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      background: linear-gradient(135deg, $color-primary-100 0%, $color-primary-200 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .feeding-avatar-text {
        font-size: $font-size-lg;
        color: $brand-primary;
        font-weight: 700;
      }
    }

    .feeding-body {
      flex: 1;
      min-width: 0;
    }

    .feeding-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12rpx;

      .feeding-user {
        font-size: $font-size-base;
        font-weight: 600;
        color: $text-primary;
      }

      .feeding-time {
        font-size: $font-size-xs;
        color: $text-muted;
      }
    }

    .feeding-bottom {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .food-chip {
        height: 44rpx;
        padding: 0 20rpx;
        border-radius: $radius-full;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.chip-primary {
          background-color: $brand-primary-light;
          .food-chip-text { color: $brand-primary; }
        }
        &.chip-warning {
          background-color: $state-warning-light;
          .food-chip-text { color: $state-warning; }
        }
        &.chip-info {
          background-color: $state-info-light;
          .food-chip-text { color: $state-info; }
        }
        &.chip-success {
          background-color: $state-success-light;
          .food-chip-text { color: $state-success; }
        }
        &.chip-default {
          background-color: $color-neutral-100;
          .food-chip-text { color: $text-muted; }
        }

        .food-chip-text {
          font-size: $font-size-xs;
          font-weight: 500;
        }
      }

      .feeding-content {
        font-size: $font-size-sm;
        color: $text-secondary;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

}

/* ========== 状态时间线 ========== */
.timeline-list {
  display: flex;
  flex-direction: column;

  .timeline-item {
    display: flex;
    gap: 20rpx;
  }


  .timeline-axis {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 28rpx;
    flex-shrink: 0;

    .timeline-dot {
      width: 20rpx;
      height: 20rpx;
      border-radius: 50%;
      background-color: $color-neutral-200;
      border: 4rpx solid $color-neutral-50;
      flex-shrink: 0;

      &.dot-first {
        background-color: $brand-primary;
        border-color: $brand-primary-light;
      }
    }

    .timeline-line {
      flex: 1;
      width: 4rpx;
      background-color: $color-neutral-200;
      min-height: 32rpx;
    }
  }


  .timeline-body {
    flex: 1;
    min-width: 0;
    padding-bottom: 32rpx;

    .timeline-content {
      font-size: $font-size-sm;
      color: $text-primary;
      line-height: 1.5;
      display: block;
      margin-bottom: 8rpx;
    }

    .timeline-meta {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .timeline-user {
        font-size: $font-size-xs;
        color: $brand-primary;
        font-weight: 500;
      }

      .timeline-dot-sep {
        font-size: $font-size-xs;
        color: $text-muted;
      }

      .timeline-time {
        font-size: $font-size-xs;
        color: $text-muted;
      }
    }
  }

}

/* ========== 时间线照片和位置 ========== */
.timeline-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin: 12rpx 0;

  .timeline-photo {
    width: 120rpx;
    height: 120rpx;
    border-radius: $radius-sm;
  }
}

.timeline-location {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin: 8rpx 0;

  .timeline-location-icon {
    font-size: 24rpx;
  }

  .timeline-location-text {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.location-clickable {
  color: $brand-primary;
  text-decoration: underline;
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 0;
  gap: 8rpx;

  .empty-emoji {
    font-size: 60rpx;
    opacity: 0.4;
    margin-bottom: 8rpx;
  }


  .empty-title {
    font-size: $font-size-base;
    color: $text-primary;
    font-weight: 600;
  }


  .empty-desc {
    font-size: $font-size-sm;
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
  background: linear-gradient(180deg, rgba(250, 248, 245, 0) 0%, rgba(250, 248, 245, 1) 30%);
  padding: 24rpx 32rpx 0;

  .feed-checkin-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    height: 96rpx;
    background-color: #ffffff;
    border: 3rpx solid $brand-primary;
    border-radius: $radius-full;
    box-shadow: 0 4rpx 16rpx rgba(255, 130, 16, 0.15);

    &:active {
      opacity: 0.85;
      transform: scale(0.98);
    }

    .feed-checkin-icon {
      font-size: 40rpx;
      color: $brand-primary;
      font-weight: 700;
    }

    .feed-checkin-text {
      font-size: $font-size-base;
      color: $brand-primary;
      font-weight: 700;
      letter-spacing: 2rpx;
    }
  }

}

.bottom-spacer {
  height: 200rpx;
}

.debug-panel {
  margin: 100rpx 40rpx;
  padding: 60rpx 40rpx;
  background: #fff8e1;
  border: 2rpx dashed #ff8210;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;

  .debug-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #ff8210;
  }

  .debug-hint {
    font-size: 28rpx;
    color: #666;
  }

  .debug-id, .debug-store-count {
    font-size: 24rpx;
    color: #999;
    font-family: monospace;
  }

  .debug-btn {
    margin-top: 30rpx;
    padding: 20rpx 60rpx;
    background: #ff8210;
    border-radius: 40rpx;
  }

  .debug-btn-text {
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
  }

}
</style>