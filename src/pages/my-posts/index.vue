<template>
  <view class="page-sub">
    <!-- 自定义顶部导航 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @tap="onBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="nav-title">我的公告</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 列表 -->
    <view class="list-wrap" :style="{ paddingTop: contentTop + 'px' }">
      <view v-if="loading" class="state-block">
        <view class="loading-spinner"></view>
        <text class="state-text">加载中...</text>
      </view>

      <view v-else-if="posts.length === 0" class="state-block">
        <text class="state-icon">📧</text>
        <text class="state-text">暂未发布过公告</text>
      </view>

      <view v-else class="post-list">
        <view
          v-for="post in posts"
          :key="post.id"
          class="post-card"
        >
          <view class="post-tag-row">
            <view class="post-tag" :style="{ backgroundColor: tagColorMap[post.type].bg, color: tagColorMap[post.type].text }">
              <text class="post-tag-text">{{ post.typeName }}</text>
            </view>
            <text class="post-time">{{ formatTime(post.publishTime) }}</text>
          </view>
          <text class="post-title">{{ post.title }}</text>
          <text class="post-content">{{ post.content }}</text>
          <view class="post-actions">
            <view class="action-item">
              <text class="action-icon">❤️</text>
              <text class="action-count">{{ post.likes }}</text>
            </view>
            <view class="action-item">
              <text class="action-icon">💬</text>
              <text class="action-count">{{ post.comments }}</text>
            </view>
            <view class="action-item action-location">
              <text class="action-icon">📍</text>
              <text class="action-count">{{ post.location }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCommunityStore } from '@/store/community'
import { formatRelativeTime } from '@/utils/format'

const communityStore = useCommunityStore()

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 44)
const contentTop = computed(() => statusBarHeight.value + 88 + 24)

const loading = ref(false)
const CURRENT_USER_NAME = '暖喵志愿者'

const tagColorMap = {
  rescue: { bg: '#fde8e8', text: '#dc2626' },
  supply: { bg: '#fff3db', text: '#ff8210' },
  status: { bg: '#e8f0fe', text: '#3b82f6' },
  adopt: { bg: '#e6f7ee', text: '#22a860' }
}

const posts = computed(() => {
  return communityStore.postList
    .filter(p => p.author === CURRENT_USER_NAME && p.status === 'published')
    .slice().sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
})

function formatTime(publishTime) {
  if (!publishTime) return ''
  try { return formatRelativeTime(publishTime) } catch (e) { return '' }
}

onShow(() => {
  loading.value = true
  if (communityStore.postList.length === 0) {
    communityStore.fetchAnnouncements().finally(() => { loading.value = false })
  } else {
    setTimeout(() => { loading.value = false }, 300)
  }
})

function onBack() {
  uni.navigateBack()
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

.post-list {
  display: block;
}

.post-card {
  width: 100%;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-color;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
}

.post-tag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;

  .post-tag {
    padding: 6rpx 16rpx;
    border-radius: $radius-full;

    .post-tag-text {
      font-size: $font-size-xs;
      font-weight: 500;
    }
  }

  .post-time {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.post-title {
  display: block;
  font-size: $font-size-base;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.post-content {
  display: block;
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 32rpx;

  .action-item {
    display: flex;
    align-items: center;
    gap: 8rpx;

    .action-icon {
      font-size: 28rpx;
    }

    .action-count {
      font-size: $font-size-xs;
      color: $text-muted;
    }

    &.action-location .action-count {
      max-width: 200rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
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
