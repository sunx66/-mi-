<template>
  <view class="page-sub">
    <!-- 自定义顶部导航 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-back" @tap="onBack">
          <text class="back-icon">‹</text>
        </view>
        <view class="nav-title">投喂记录</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 列表 -->
    <view class="list-wrap" :style="{ paddingTop: contentTop + 'px' }">
      <view v-if="loading" class="state-block">
        <view class="loading-spinner"></view>
        <text class="state-text">加载中...</text>
      </view>

      <view v-else-if="records.length === 0" class="state-block">
        <text class="state-icon">🍽</text>
        <text class="state-text">暂无投喂记录，去帮帮小猫咪吧</text>
      </view>

      <view v-else class="record-list">
        <view
          v-for="item in records"
          :key="item.id"
          class="record-card"
          @tap="onRecordTap(item)"
        >
          <view class="card-header">
            <text class="cat-name">{{ item.catName }}</text>
            <text class="record-time">{{ item.time }}</text>
          </view>
          <view class="card-body">
            <view class="food-tag" :style="{ backgroundColor: foodColorMap[item.foodColor] || foodColorMap.default }">
              <text class="food-text">{{ item.foodType }}</text>
            </view>
            <text v-if="item.foodWeight" class="food-weight">{{ item.foodWeight }}</text>
          </view>
          <text v-if="item.content" class="card-content">{{ item.content }}</text>
          <text v-if="item.location" class="card-location">📍 {{ item.location }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCatStore } from '@/store/cat'

const catStore = useCatStore()

const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 44)
const contentTop = computed(() => statusBarHeight.value + 88 + 24)

const loading = ref(false)

const CURRENT_USER_NAME = '暖喵志愿者'

const foodColorMap = {
  primary: 'rgba(255, 130, 16, 0.12)',
  warning: 'rgba(230, 138, 0, 0.12)',
  info: 'rgba(59, 130, 246, 0.12)',
  success: 'rgba(34, 168, 96, 0.12)',
  default: 'rgba(150, 150, 150, 0.12)'
}

// 当前用户全部投喂记录（聚合所有猫咪）
const records = computed(() => {
  const list = []
  catStore.catList.forEach(cat => {
    ;(cat.feedingRecords || []).forEach(r => {
      if (r.user === CURRENT_USER_NAME) {
        list.push({
          id: r.id,
          catId: cat.id,
          catName: cat.name,
          foodType: r.foodType,
          foodColor: r.foodColor,
          foodWeight: r.foodWeight,
          content: r.content,
          time: r.time,
          location: r.location
        })
      }
    })
  })
  return list
})

onShow(() => {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
})

function onBack() {
  uni.navigateBack()
}

function onRecordTap(item) {
  uni.navigateTo({ url: `/pages/cat-profile/index?id=${item.catId}` })
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

.record-list {
  display: block;
}

.record-card {
  width: 100%;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-color;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;

  &:active {
    background-color: $color-neutral-100;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;

  .cat-name {
    font-size: $font-size-base;
    font-weight: 700;
    color: $text-primary;
  }

  .record-time {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.card-body {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;

  .food-tag {
    padding: 6rpx 16rpx;
    border-radius: $radius-full;

    .food-text {
      font-size: $font-size-xs;
      color: $text-primary;
      font-weight: 500;
    }
  }

  .food-weight {
    font-size: $font-size-xs;
    color: $text-secondary;
  }
}

.card-content {
  display: block;
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 8rpx;
}

.card-location {
  display: block;
  font-size: $font-size-xs;
  color: $text-muted;
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
