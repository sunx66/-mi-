<template>
  <view class="page-sub">
    <!-- 自定义顶部导航 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @tap="onBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="nav-title">收藏点位</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 列表 -->
    <view class="list-wrap" :style="{ paddingTop: contentTop + 'px' }">
      <view v-if="loading" class="state-block">
        <view class="loading-spinner"></view>
        <text class="state-text">加载中...</text>
      </view>

      <view v-else-if="cats.length === 0" class="state-block">
        <text class="state-icon">⭐</text>
        <text class="state-text">暂无收藏点位</text>
      </view>

      <view v-else class="cat-list">
        <view
          v-for="cat in cats"
          :key="cat.id"
          class="cat-card"
        >
          <view class="cat-avatar" :style="{ backgroundColor: getStatusColor(cat.status).bg }">
            <text class="cat-emoji">🐱</text>
          </view>
          <view class="cat-info" @tap="onCatTap(cat)">
            <text class="cat-name">{{ cat.name }}</text>
            <text class="cat-location">📍 {{ cat.location }}</text>
            <text class="cat-meta">{{ cat.color }} · {{ cat.statusText || '健康' }}</text>
          </view>
          <view class="unfav-btn" @tap.stop="onUnfavorite(cat)">
            <text class="unfav-icon">★</text>
            <text class="unfav-text">取消</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCatStore } from '@/store/cat'
import { useUserStore } from '@/store/user'
import { getStatusColor } from '@/utils/format'

const catStore = useCatStore()
const userStore = useUserStore()

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 44)
const contentTop = computed(() => statusBarHeight.value + 88 + 24)

const loading = ref(false)

const cats = computed(() => {
  return userStore.favoriteCats
    .map(id => catStore.getCatById(id))
    .filter(Boolean)
})

onShow(() => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
})

function onBack() {
  uni.navigateBack()
}

function onCatTap(cat) {
  uni.navigateTo({ url: `/pages/cat-profile/index?id=${cat.id}` })
}

function onUnfavorite(cat) {
  uni.showModal({
    title: '提示',
    content: `确定取消收藏「${cat.name}」吗？`,
    success: (res) => {
      if (res.confirm) {
        userStore.toggleFavorite(cat.id)
        uni.showToast({ title: '已取消收藏', icon: 'none' })
      }
    }
  })
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-sub {
  width: 100%;
  min-height: 100vh;
  background-color: $bg-page;
}

.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: $bg-card;
  box-shadow: $shadow-sm;

  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 24rpx;
    position: relative;

    .nav-back {
      position: absolute;
      left: 24rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 72rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .back-icon {
        font-size: 56rpx;
        color: $text-primary;
        line-height: 1;
      }
    }

    .nav-title {
      font-size: $font-size-lg;
      font-weight: 700;
      color: $text-primary;
    }

    .nav-right {
      width: 72rpx;
    }
  }
}

.list-wrap {
  padding: 0 24rpx;
}

.cat-list {
  display: block;
}

.cat-card {
  width: 100%;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-color;
  padding: 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: $shadow-sm;

  &:active {
    background-color: $color-neutral-100;
  }
}

.cat-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .cat-emoji {
    font-size: 40rpx;
  }
}

.cat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .cat-name {
    font-size: $font-size-base;
    font-weight: 700;
    color: $text-primary;
  }

  .cat-location {
    font-size: $font-size-xs;
    color: $text-secondary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cat-meta {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.unfav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 16rpx;
  border-radius: $radius-md;
  background-color: $color-neutral-100;

  &:active {
    background-color: $color-neutral-200;
  }

  .unfav-icon {
    font-size: 32rpx;
    color: #e68a00;
  }

  .unfav-text {
    font-size: 20rpx;
    color: $text-muted;
    margin-top: 4rpx;
  }
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  gap: 20rpx;

  .state-icon {
    font-size: 80rpx;
  }

  .state-text {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 6rpx solid $color-neutral-200;
  border-top-color: $brand-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
