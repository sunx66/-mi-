<template>
  <view class="page-guide">
    <!-- 自定义顶部导航 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-left"></view>
        <view class="nav-title">帮扶指南</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 指南卡片网格 -->
    <view class="guide-content" :style="{ paddingTop: contentTop + 'px' }">
      <!-- 加载中 -->
      <view v-if="loading" class="state-block">
        <view class="loading-spinner"></view>
        <text class="state-text">加载中...</text>
      </view>

      <!-- 加载失败 -->
      <view v-else-if="errorMsg" class="state-block">
        <text class="state-icon">⚠️</text>
        <text class="state-text">{{ errorMsg }}</text>
        <view class="retry-btn" @tap="loadGuides">
          <text class="retry-text">点击重试</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="guideCards.length === 0" class="state-block">
        <text class="state-icon">📭</text>
        <text class="state-text">暂无指南内容</text>
      </view>

      <!-- 卡片列表 -->
      <view v-else class="guide-grid">
        <view
          v-for="card in guideCards"
          :key="card.id"
          class="guide-card"
          :style="{ borderLeftColor: card.color }"
          @tap="onCardTap(card)"
        >
          <!-- 图标区域 -->
          <view class="card-icon-area" :style="{ backgroundColor: card.bgColor }">
            <text class="card-icon">{{ card.icon }}</text>
          </view>

          <!-- 标题 -->
          <text class="card-title">{{ card.title }}</text>

          <!-- 条目列表 -->
          <view class="card-items">
            <view
              v-for="item in card.summary"
              :key="item"
              class="card-item"
            >
              <text class="item-dot" :style="{ backgroundColor: card.color }"></text>
              <text class="item-text">{{ item }}</text>
            </view>
          </view>

          <!-- 右箭头 -->
          <text class="card-arrow">&#x203A;</text>
        </view>
      </view>
    </view>

    <!-- 指南详情弹窗 -->
    <view v-if="detailVisible" class="detail-mask" @tap="closeDetail">
      <view class="detail-popup" @tap.stop>
        <view class="detail-header">
          <view class="detail-icon-area" :style="{ backgroundColor: currentDetail.bgColor }">
            <text class="detail-icon">{{ currentDetail.icon }}</text>
          </view>
          <text class="detail-title">{{ currentDetail.title }}</text>
          <view class="detail-close" @tap="closeDetail">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <scroll-view class="detail-body" scroll-y :show-scrollbar="false">
          <text class="detail-content">{{ currentDetail.content }}</text>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { mockGuideList } from '@/mock/guide'

// 系统信息
const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 44)

// 内容区域 top
const contentTop = computed(() => statusBarHeight.value + 88 + 24)

// 指南数据与状态
const guideCards = ref([])
const loading = ref(false)
const errorMsg = ref('')

// 详情弹窗状态
const detailVisible = ref(false)
const currentDetail = ref({})

// 加载指南数据（模拟异步请求）
function loadGuides() {
  loading.value = true
  errorMsg.value = ''
  setTimeout(() => {
    try {
      guideCards.value = mockGuideList
      loading.value = false
    } catch (e) {
      guideCards.value = []
      loading.value = false
      errorMsg.value = '加载失败，请重试'
    }
  }, 800)
}

onShow(() => {
  loadGuides()
})

// 点击卡片 → 弹出指南详情
function onCardTap(card) {
  currentDetail.value = card
  detailVisible.value = true
}

// 关闭详情
function closeDetail() {
  detailVisible.value = false
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-guide {
  width: 100%;
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: calc(#{$tab-bar-height} + #{$safe-bottom});
}

/* ========== 自定义导航 ========== */
.custom-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: $bg-card;
  box-shadow: $shadow-sm;

  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 32rpx;
    position: relative;

    .nav-left {
      width: 80rpx;
    }

    .nav-title {
      font-size: $font-size-lg;
      font-weight: 700;
      color: $text-primary;
      letter-spacing: 2rpx;
    }

    .nav-right {
      width: 80rpx;
    }
  }
}

/* ========== 指南内容 ========== */
.guide-content {
  padding: 0 24rpx;
}

.guide-grid {
  display: block;
}

/* ========== 指南卡片 ========== */
.guide-card {
  width: 100%;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-color;
  border-left: 8rpx solid;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  position: relative;
  box-shadow: $shadow-sm;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.97);
    background-color: $color-neutral-100;
  }
}

/* 图标区域 */
.card-icon-area {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;

  .card-icon {
    font-size: 40rpx;
  }
}

/* 标题 */
.card-title {
  display: block;
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
}

/* 条目列表 */
.card-items {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 12rpx;

  .card-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;

    .item-dot {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 10rpx;
    }

    .item-text {
      font-size: $font-size-xs;
      color: $text-secondary;
      line-height: 1.4;
    }
  }
}

/* 右箭头 */
.card-arrow {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  font-size: 44rpx;
  color: $color-neutral-300;
  line-height: 1;
}

/* ========== 加载/错误状态 ========== */
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

  .retry-btn {
    margin-top: 12rpx;
    padding: 16rpx 48rpx;
    background-color: $brand-primary;
    border-radius: $radius-full;

    &:active {
      opacity: 0.85;
    }

    .retry-text {
      font-size: $font-size-sm;
      color: #ffffff;
      font-weight: 600;
    }
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

/* ========== 详情弹窗 ========== */
.detail-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 32rpx;
}

.detail-popup {
  width: 100%;
  max-height: 80vh;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .detail-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding-bottom: 20rpx;
    margin-bottom: 20rpx;
    border-bottom: 1rpx solid $color-neutral-100;

    .detail-icon-area {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .detail-icon {
        font-size: 36rpx;
      }
    }

    .detail-title {
      flex: 1;
      font-size: $font-size-lg;
      font-weight: 700;
      color: $text-primary;
    }

    .detail-close {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .close-icon {
        font-size: 36rpx;
        color: $text-muted;
      }
    }
  }

  .detail-body {
    flex: 1;
    min-height: 0;

    .detail-content {
      display: block;
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}
</style>
