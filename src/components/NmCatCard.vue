<template>
  <view
    class="nm-cat-card"
    :class="{ 'nm-cat-card--selected': isSelected }"
    @tap="handleTap"
  >
    <view class="cat-card-top" :class="{ 'cat-card-top--photo': isPhoto }">
      <image 
        v-if="avatarSrc && !failedPhotoIds.has(cat.id)" 
        class="cat-photo" 
        :src="avatarSrc" 
        mode="aspectFill"
        @error="onPhotoError(cat.id)"
      />
      <view v-else class="cat-avatar" :class="'status-bg-' + cat.status">
        <text class="cat-avatar-icon">🐱</text>
      </view>
      <view class="cat-status-dot" :class="'dot-' + cat.status"></view>
      <view v-if="cat.statusText" class="status-badge" :class="'badge-' + cat.status">
        <text class="badge-text">{{ cat.statusText }}</text>
      </view>
    </view>
    <view class="cat-card-body">
      <text class="cat-name">{{ cat.name }}</text>
      <view class="cat-meta">
        <text class="cat-color">{{ cat.color }}</text>
        <text class="cat-sep">·</text>
        <text class="cat-body-type">{{ cat.bodyType }}</text>
      </view>
      <view class="cat-location-row" @tap.stop="onLocationTap">
        <text class="cat-loc-icon">◎</text>
        <text class="cat-distance">{{ formatCatDistance }}</text>
        <text class="cat-nav-icon">&#x1F9ED;</text>
      </view>
    </view>
    <view class="cat-card-footer">
      <NmStatusTag :status="cat.status" />
      <text class="cat-update">{{ cat.lastUpdate }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import NmStatusTag from './NmStatusTag.vue'
import { getCartoonAvatar } from '@/utils/cartoonCat'
import { formatDistance } from '@/utils/location'
import { openExternalNavigation } from '@/utils/mapNav'

const props = defineProps({
  cat: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cattap'])

const failedPhotoIds = ref(new Set())

const avatarSrc = computed(() => {
  const cat = props.cat
  if (cat.avatarType === 'photo' && cat.photos && cat.photos.length > 0) {
    return cat.photos[0]
  }
  return getCartoonAvatar(cat).avatar
})

const isPhoto = computed(() => props.cat.avatarType === 'photo')

const formatCatDistance = computed(() => {
  if (props.cat.distance === undefined || props.cat.distance === null) return ''
  const km = props.cat.distance
  if (km < 1) return Math.round(km * 1000) + 'm'
  return km + 'km'
})

function onPhotoError(catId) {
  if (props.cat.avatarType === 'photo') {
    failedPhotoIds.value.add(catId)
  }
}

function handleTap() {
  emit('cattap', props.cat)
}

// 点击距离行跳转外部导航
function onLocationTap() {
  if (props.cat.latitude && props.cat.longitude) {
    openExternalNavigation(props.cat.latitude, props.cat.longitude, props.cat.name + '的位置')
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.nm-cat-card {
  display: inline-flex;
  flex-direction: column;
  width: 280rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-color;
  box-shadow: $shadow-sm;
  overflow: hidden;
  flex-shrink: 0;
  transition: transform 0.2s, box-shadow 0.2s;

  &:active {
    transform: scale(0.97);
  }

  &--selected {
    border-color: $brand-primary;
    box-shadow: 0 8rpx 24rpx rgba(255, 130, 16, 0.35);
    transform: scale(1.02);
  }

  .cat-card-top {
    position: relative;
    height: 220rpx;
    background: linear-gradient(135deg, rgba(255, 130, 16, 0.08) 0%, rgba(245, 245, 245, 0.5) 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    .cat-photo {
      width: 100%;
      height: 100%;
    }

    .cat-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.status-bg-healthy { background-color: $state-success-light; }
      &.status-bg-attention { background-color: $state-warning-light; }
      &.status-bg-urgent { background-color: $state-error-light; }
      &.status-bg-minor { background-color: $state-warning-light; }
      &.status-bg-severe { background-color: $state-error-light; }

      .cat-avatar-icon { font-size: 64rpx; }
    }

    &.cat-card-top--photo {
      background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
    }

    .cat-status-dot {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
      width: 24rpx;
      height: 24rpx;
      border-radius: 50%;
      border: 3rpx solid #fff;
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);

      &.dot-healthy { background-color: $state-success; }
      &.dot-attention { background-color: $state-warning; }
      &.dot-urgent { background-color: $state-error; }
      &.dot-minor { background-color: $state-warning; }
      &.dot-severe { background-color: $state-error; }
    }

    .status-badge {
      position: absolute;
      bottom: 12rpx;
      left: 50%;
      transform: translateX(-50%);
      height: 36rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 20rpx;
      border-radius: $radius-full;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);

      &.badge-healthy {
        background-color: $state-success;
        .badge-text { color: #fff; }
      }
      &.badge-attention {
        background-color: $state-warning;
        .badge-text { color: #fff; }
      }
      &.badge-urgent {
        background-color: $state-error;
        animation: pulse 1.5s infinite;
        .badge-text { color: #fff; }
      }
      &.badge-minor {
        background-color: $state-warning;
        .badge-text { color: #fff; }
      }
      &.badge-severe {
        background-color: $state-error;
        animation: pulse 1.5s infinite;
        .badge-text { color: #fff; }
      }

      .badge-text {
        font-size: 20rpx;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  }

  .cat-card-body {
    padding: 20rpx 24rpx 16rpx;

    .cat-name {
      font-size: $font-size-lg;
      font-weight: 700;
      color: $text-primary;
      display: block;
      margin-bottom: 8rpx;
    }

    .cat-meta {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 10rpx;

      .cat-color,
      .cat-body-type {
        font-size: $font-size-xs;
        color: $text-muted;
      }

      .cat-sep {
        font-size: $font-size-xs;
        color: $color-neutral-300;
      }
    }

    .cat-location-row {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .cat-loc-icon {
        font-size: 22rpx;
        color: $brand-primary;
      }

      .cat-distance {
        font-size: $font-size-xs;
        color: $brand-primary;
        font-weight: 500;
      }
    }
  }

  .cat-nav-icon {
  font-size: 24rpx;
  margin-left: 4rpx;
  opacity: 0.6;
}

.cat-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12rpx 24rpx 20rpx;
    border-top: 1rpx solid $color-neutral-100;

    .cat-update {
      font-size: $font-size-xs;
      color: $text-muted;
    }
  }
}
</style>