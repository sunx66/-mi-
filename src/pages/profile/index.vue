<template>
  <view class="page-profile">
    <!-- Profile 头部 -->
    <view class="profile-header">
      <!-- 设置按钮 -->
      <view class="settings-btn" @tap="onSettings">
        <text class="settings-icon">⚙</text>
      </view>

      <!-- 头像与用户信息 -->
      <view class="profile-info">
        <view class="avatar-circle">
          <text class="avatar-cat-icon">🐱</text>
        </view>
        <text class="username">{{ userStore.userInfo.nickname }}</text>
        <text class="user-subtitle">爱心帮扶第 {{ userStore.userInfo.joinDays }} 天</text>
      </view>

      <!-- 统计数据行 -->
      <view class="stats-row">
        <view class="stats-item">
          <text class="stats-value">{{ feedCount }}</text>
          <text class="stats-label">投喂次数</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item">
          <text class="stats-value">{{ updateCount }}</text>
          <text class="stats-label">更新档案</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item">
          <text class="stats-value">{{ helpCount }}</text>
          <text class="stats-label">帮助他人</text>
        </view>
      </view>
    </view>

    <!-- 我的记录 -->
    <view class="section">
      <text class="section-title">我的记录</text>
      <view class="record-grid">
        <view
          v-for="record in recordList"
          :key="record.title"
          class="record-card"
          @tap="onRecordTap(record)"
        >
          <view class="record-icon-area" :style="{ backgroundColor: record.bgColor }">
            <text class="record-icon">{{ record.icon }}</text>
          </view>
          <view class="record-info">
            <text class="record-title">{{ record.title }}</text>
            <text class="record-count" :style="{ color: record.color }">{{ record.count }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 更多 -->
    <view class="section">
      <text class="section-title">更多</text>
      <view class="menu-card">
        <view
          v-for="(menu, index) in menuList"
          :key="menu.title"
          class="menu-item"
          :class="{ 'menu-item-border': index < menuList.length - 1 }"
          @tap="onMenuTap(menu)"
        >
          <view class="menu-icon-area" :style="{ backgroundColor: menu.bgColor }">
            <text class="menu-icon">{{ menu.icon }}</text>
          </view>
          <text class="menu-title">{{ menu.title }}</text>
          <text class="menu-chevron">›</text>
        </view>
      </view>
    </view>

    <!-- TabBar 底部安全距离 -->
    <view class="bottom-safe"></view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'; import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useCatStore } from '@/store/cat'
import { useCommunityStore } from '@/store/community'

const userStore = useUserStore()
const catStore = useCatStore()
const communityStore = useCommunityStore()

const CURRENT_USER_NAME = '暖喵志愿者'

// ============ 顶部统计（从多 store 派生，确保数据一致性） ============

// 投喂次数：所有猫咪的 feedingRecords 中当前用户的记录数
const feedCount = computed(() => {
  return catStore.catList.reduce((sum, cat) => {
    const records = (cat.feedingRecords || []).filter(r => r.user === CURRENT_USER_NAME)
    return sum + records.length
  }, 0)
})

// 更新档案：当前用户创建的猫咪档案数
const updateCount = computed(() => {
  return catStore.catList.filter(c => c.createBy === userStore.userInfo.id).length
})

// 我的公告数：当前用户发布的帖子数
const myPostCount = computed(() => {
  return communityStore.postList.filter(p => p.author === CURRENT_USER_NAME && p.status === 'published').length
})

// 我的评论数：当前用户在所有帖子下的评论数
const myCommentCount = computed(() => {
  let count = 0
  Object.values(communityStore.commentsMap).forEach(list => {
    count += (list || []).filter(c => c.author === CURRENT_USER_NAME).length
  })
  return count
})

// 帮助他人：发帖 + 评论 综合计数
const helpCount = computed(() => myPostCount.value + myCommentCount.value)

// 收藏点位数
const favoriteCount = computed(() => userStore.favoriteCats.length)

// ============ 记录列表（角标与顶部统计同源） ============
const recordList = computed(() => [
  {
    title: '投喂记录',
    icon: '🍽',
    color: '#ff8210',
    bgColor: 'rgba(255, 130, 16, 0.08)',
    count: feedCount.value,
    route: '/pages/feed-records/index'
  },
  {
    title: '我的公告',
    icon: '📧',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    count: myPostCount.value,
    route: '/pages/my-posts/index'
  },
  {
    title: '更新档案',
    icon: '📄',
    color: '#22a860',
    bgColor: 'rgba(34, 168, 96, 0.08)',
    count: updateCount.value,
    route: '/pages/cat-archives/index'
  },
  {
    title: '收藏点位',
    icon: '⭐',
    color: '#e68a00',
    bgColor: 'rgba(230, 138, 0, 0.08)',
    count: favoriteCount.value,
    route: '/pages/favorite-spots/index'
  }
])

// 更多菜单数据
const menuList = [
  {
    title: '帮助与反馈',
    icon: '❓',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.08)'
  },
  {
    title: '隐私设置',
    icon: '🔒',
    color: '#ff8210',
    bgColor: 'rgba(255, 130, 16, 0.08)'
  },
  {
    title: '关于暖喵',
    icon: '❤️',
    color: '#22a860',
    bgColor: 'rgba(34, 168, 96, 0.08)'
  }
]

// 生命周期：onShow 每次返回页面都会触发，确保数据实时同步
onShow(() => {
  if (!userStore.isLoggedIn) {
    userStore.initMockUser()
  }
  // 确保各 store 数据已初始化（幂等操作）
  if (catStore.catList.length === 0) {
    catStore.initMockData()
  }
  if (communityStore.postList.length === 0) {
    communityStore.fetchAnnouncements()
  }
})

// 设置
function onSettings() {
  uni.showToast({ title: '设置功能开发中', icon: 'none' })
}

// 记录点击 → 跳转子页面
function onRecordTap(record) {
  uni.navigateTo({ url: record.route })
}

// 菜单点击
function onMenuTap(menu) {
  uni.showToast({ title: `${menu.title} - 开发中`, icon: 'none' })
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-profile {
  width: 100%;
  min-height: 100vh;
  background-color: $bg-page;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* ========== Profile 头部 ========== */
.profile-header {
  background: linear-gradient(135deg, #ff9c35 0%, #ff8210 100%);
  padding: 48rpx 24rpx 56rpx;
  border-radius: 0 0 60rpx 60rpx;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
}

/* 设置按钮 */
.settings-btn {
  position: absolute;
  top: 48rpx;
  right: 24rpx;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .settings-icon {
    font-size: 36rpx;
    color: #ffffff;
  }
}

/* 用户信息 */
.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16rpx;
}

.avatar-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.25);
  border: 4rpx solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;

  .avatar-cat-icon {
    font-size: 72rpx;
  }
}

.username {
  font-size: $font-size-xl;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.user-subtitle {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 40rpx;
}

/* 统计行 */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: $radius-lg;
  padding: 28rpx 0;
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  .stats-value {
    font-size: $font-size-xl;
    font-weight: 700;
    color: #ffffff;
  }

  .stats-label {
    font-size: $font-size-xs;
    color: rgba(255, 255, 255, 0.75);
  }
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background-color: rgba(255, 255, 255, 0.2);
}

/* ========== Section ========== */
.section {
  padding: 32rpx 24rpx 0;
  box-sizing: border-box;
  width: 100%;

  .section-title {
    display: block;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 24rpx;
  }
}

/* ========== 我的记录 2x2 网格 ========== */
.record-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.record-card {
  width: calc(50% - 10rpx);
  background-color: $bg-card;
  border-radius: $radius-xl;
  border: 1rpx solid $border-color;
  padding: 28rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: $shadow-sm;
  box-sizing: border-box;

  &:active {
    background-color: $color-neutral-100;
  }
}

.record-icon-area {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;

  .record-icon {
    font-size: 44rpx;
  }
}

.record-info {
  display: flex;
  align-items: center;
  gap: 8rpx;

  .record-title {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: 500;
  }

  .record-count {
    font-size: $font-size-sm;
    font-weight: 700;
  }
}

/* ========== 更多菜单 ========== */
.menu-card {
  width: 100%;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 1rpx solid $border-color;
  box-shadow: $shadow-sm;
  overflow: hidden;
  box-sizing: border-box;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;

  &.menu-item-border {
    border-bottom: 1rpx solid $color-neutral-100;
  }

  &:active {
    background-color: $color-neutral-100;
  }
}

.menu-icon-area {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;

  .menu-icon {
    font-size: 36rpx;
  }
}

.menu-title {
  flex: 1;
  font-size: $font-size-base;
  color: $text-primary;
  font-weight: 500;
}

.menu-chevron {
  font-size: 40rpx;
  color: $color-neutral-300;
  line-height: 1;
}

/* ========== 底部安全区 ========== */
.bottom-safe {
  height: calc(#{$tab-bar-height} + #{$safe-bottom});
}
</style>
