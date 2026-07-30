<template>
  <view class="nm-status-tag" :style="tagStyle">
    <text class="status-dot" :style="{ backgroundColor: statusInfo.color }"></text>
    <text class="status-text">{{ statusInfo.text }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'healthy'
  }
})

const statusMap = {
  healthy: { color: '#22a860', bg: '#e6f7ee', text: '健康' },
  attention: { color: '#e68a00', bg: '#fff3db', text: '需关注' },
  urgent: { color: '#dc2626', bg: '#fde8e8', text: '需救助' },
  minor: { color: '#e68a00', bg: '#fff3db', text: '轻微伤病' },
  severe: { color: '#dc2626', bg: '#fde8e8', text: '重伤病' }
}

const statusInfo = computed(() => statusMap[props.status] || statusMap.healthy)

const tagStyle = computed(() => ({
  backgroundColor: statusInfo.value.bg,
  color: statusInfo.value.color
}))
</script>

<style lang="scss" scoped>
.nm-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 4rpx 14rpx;
  border-radius: 9999rpx;

  .status-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
  }

  .status-text {
    font-size: 22rpx;
    font-weight: 500;
    line-height: 1.4;
  }
}
</style>
