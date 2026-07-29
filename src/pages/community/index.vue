<template>
  <view class="page-community">
    <!-- 自定义顶部导航 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-left"></view>
        <view class="nav-title">互助公告</view>
        <view class="nav-right" @tap="onSearchTap">
          <text class="nav-search-icon">🔍</text>
        </view>
      </view>

      <!-- 横向滚动 Tab 行 -->
      <scroll-view class="tab-scroll" scroll-x :show-scrollbar="false">
        <view class="tab-list">
          <view
            v-for="tab in tabList"
            :key="tab.value"
            class="tab-item"
            :class="{ active: communityStore.activeTab === tab.value }"
            @tap="communityStore.setTab(tab.value)"
          >
            <text class="tab-text">{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 浮动发布按钮 -->
    <view
      class="publish-fab"
      :style="{ top: fabTop + 'px' }"
      @tap="onPublish"
    >
      <text class="fab-plus">+</text>
      <text class="fab-label">发布</text>
    </view>

    <!-- 帖子列表 -->
    <view
      class="post-list"
      :style="{ paddingTop: listTop + 'px' }"
    >
      <!-- 加载中 -->
      <view v-if="communityStore.loading" class="state-block">
        <view class="loading-spinner"></view>
        <text class="state-text">加载中...</text>
      </view>

      <!-- 加载失败 -->
      <view v-else-if="communityStore.error" class="state-block">
        <text class="state-icon">⚠️</text>
        <text class="state-text">{{ communityStore.error }}</text>
        <view class="retry-btn" @tap="retryLoad">
          <text class="retry-text">点击重试</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="posts.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无相关公告</text>
      </view>

      <!-- 帖子卡片列表 -->
      <template v-else>
        <view
          v-for="post in posts"
          :key="post.id"
          class="post-card"
          :class="{ 'post-urgent': post.isUrgent }"
          @tap="onPostTap(post)"
        >
          <!-- 用户行 -->
          <view class="post-user-row">
            <view class="post-avatar" :style="{ backgroundColor: post.authorColor }">
              <text class="avatar-char">{{ post.author.charAt(0) }}</text>
            </view>
            <view class="post-user-info">
              <text class="post-author">{{ post.author }}</text>
            </view>
            <text class="post-time">{{ formatTime(post.publishTime) }}</text>
          </view>

          <!-- 标签 -->
          <view class="post-tag-row">
            <view class="post-tag" :style="{ backgroundColor: tagColorMap[post.type].bg, color: tagColorMap[post.type].text }">
              <text class="post-tag-text">{{ post.typeName }}</text>
            </view>
          </view>

          <!-- 标题 -->
          <text class="post-title">{{ post.title }}</text>

          <!-- 内容 -->
          <text class="post-content">{{ post.content }}</text>

          <!-- 底部操作行 -->
          <view class="post-actions">
            <view class="action-item like-btn" @tap.stop="onLikeTap(post)">
              <text class="action-icon" :class="{ 'liked': communityStore.isLiked(post.id) }">{{ communityStore.isLiked(post.id) ? '❤️' : '🤍' }}</text>
              <text class="action-count" :class="{ 'liked': communityStore.isLiked(post.id) }">{{ post.likes }}</text>
            </view>
            <view class="action-item comment-btn" @tap.stop="onCommentTap(post)">
              <text class="action-icon">💬</text>
              <text class="action-count">{{ post.comments }}</text>
            </view>
            <view class="action-item action-location">
              <text class="action-icon">📍</text>
              <text class="action-count">{{ post.location }}</text>
            </view>
          </view>
        </view>
      </template>
    </view>

    <!-- 公告详情弹窗 -->
    <view v-if="detailVisible" class="detail-mask" @tap="closeDetail">
      <view class="detail-popup" @tap.stop>
        <view class="detail-header">
          <text class="detail-tag" :style="{ backgroundColor: tagColorMap[currentDetail.type].bg, color: tagColorMap[currentDetail.type].text }">
            {{ currentDetail.typeName }}
          </text>
          <view class="detail-close" @tap="closeDetail">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <text class="detail-title">{{ currentDetail.title }}</text>
        <view class="detail-meta">
          <text class="detail-author">{{ currentDetail.author }}</text>
          <text class="detail-time">{{ formatTime(currentDetail.publishTime) }}</text>
          <text class="detail-location">📍 {{ currentDetail.location }}</text>
        </view>
        <scroll-view class="detail-body" scroll-y :show-scrollbar="false">
          <text class="detail-content">{{ currentDetail.contentFull || currentDetail.content }}</text>
        </scroll-view>
      </view>
    </view>

    <!-- 发布帖子弹窗 -->
    <view v-if="publishVisible" class="detail-mask" @tap="closePublish">
      <view class="publish-popup" @tap.stop>
        <view class="detail-header">
          <text class="publish-title">发布帖子</text>
          <view class="detail-close" @tap="closePublish">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <scroll-view class="publish-body" scroll-y :show-scrollbar="false">
          <!-- 分类选择 -->
          <view class="form-section">
            <text class="form-label">分类 <text class="required">*</text></text>
            <view class="type-list">
              <view
                v-for="item in publishTypeList"
                :key="item.value"
                class="type-chip"
                :class="{ active: publishForm.type === item.value }"
                @tap="publishForm.type = item.value"
              >
                <text class="type-chip-text">{{ item.label }}</text>
              </view>
            </view>
          </view>

          <!-- 标题 -->
          <view class="form-section">
            <text class="form-label">标题 <text class="required">*</text></text>
            <input
              class="form-input"
              v-model="publishForm.title"
              placeholder="请输入帖子标题"
              placeholder-class="input-placeholder"
              maxlength="30"
            />
          </view>

          <!-- 正文 -->
          <view class="form-section">
            <text class="form-label">正文 <text class="required">*</text></text>
            <textarea
              class="form-textarea"
              v-model="publishForm.content"
              placeholder="详细描述帖子内容..."
              placeholder-class="input-placeholder"
              :maxlength="500"
              :auto-height="true"
            />
          </view>

          <!-- 地点 -->
          <view class="form-section">
            <text class="form-label">事发地点</text>
            <input
              class="form-input"
              v-model="publishForm.location"
              placeholder="选填，如：阳光小区"
              placeholder-class="input-placeholder"
              maxlength="50"
            />
          </view>
        </scroll-view>

        <!-- 提交按钮 -->
        <view class="publish-footer">
          <view
            class="submit-btn"
            :class="{ disabled: communityStore.submitting }"
            @tap="onSubmitPost"
          >
            <text class="submit-text">{{ communityStore.submitting ? '发布中...' : '发布' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 评论抽屉 -->
    <view v-if="commentVisible" class="comment-mask" @tap="closeComment">
      <view class="comment-drawer" @tap.stop>
        <view class="comment-header">
          <text class="comment-title">评论</text>
          <view class="detail-close" @tap="closeComment">
            <text class="close-icon">✕</text>
          </view>
        </view>

        <!-- 评论列表 -->
        <scroll-view class="comment-list" scroll-y :show-scrollbar="false">
          <view v-if="communityStore.commentsLoading" class="comment-loading">
            <view class="loading-spinner small"></view>
            <text class="state-text">加载中...</text>
          </view>
          <view v-else-if="currentComments.length === 0" class="comment-empty">
            <text class="empty-icon">💬</text>
            <text class="empty-text">暂无评论，快来抢沙发</text>
          </view>
          <view v-else class="comment-items">
            <view
              v-for="comment in currentComments"
              :key="comment.id"
              class="comment-item"
            >
              <view class="comment-avatar" :style="{ backgroundColor: comment.authorColor }">
                <text class="avatar-char">{{ comment.author.charAt(0) }}</text>
              </view>
              <view class="comment-body">
                <view class="comment-meta">
                  <text class="comment-author">{{ comment.author }}</text>
                  <text class="comment-time">{{ formatTime(comment.createTime) }}</text>
                </view>
                <text class="comment-content">{{ comment.content }}</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 评论输入框 -->
        <view class="comment-input-bar">
          <input
            class="comment-input"
            v-model="commentText"
            placeholder="写下你的评论..."
            placeholder-class="input-placeholder"
            confirm-type="send"
            @confirm="onSendComment"
          />
          <view
            class="send-btn"
            :class="{ disabled: !commentText.trim() || sendingComment }"
            @tap="onSendComment"
          >
            <text class="send-text">{{ sendingComment ? '...' : '发送' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'; import { onShow } from '@dcloudio/uni-app'
import { useCommunityStore } from '@/store/community'
import { formatRelativeTime, formatDate } from '@/utils/format'

const communityStore = useCommunityStore()

// 系统信息
const sysInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(sysInfo.statusBarHeight || 44)

// Tab 配置
const tabList = [
  { label: '全部', value: 'all' },
  { label: '救助求助', value: 'rescue' },
  { label: '物资互助', value: 'supply' },
  { label: '状态播报', value: 'status' },
  { label: '领养预告', value: 'adopt' }
]

// 标签颜色映射
const tagColorMap = {
  rescue: { bg: '#fde8e8', text: '#dc2626' },
  supply: { bg: '#fff3db', text: '#ff8210' },
  status: { bg: '#e8f0fe', text: '#3b82f6' },
  adopt: { bg: '#e6f7ee', text: '#22a860' }
}

// 发布表单分类
const publishTypeList = [
  { label: '救助求助', value: 'rescue' },
  { label: '物资互助', value: 'supply' },
  { label: '状态播报', value: 'status' },
  { label: '领养预告', value: 'adopt' }
]

// FAB 位置
const fabTop = computed(() => statusBarHeight.value + 176)

// 列表 top 间距
const listTop = computed(() => statusBarHeight.value + 88 + 80 + 16)

// 帖子列表
const posts = computed(() => communityStore.getFilteredPosts())

// 详情弹窗状态
const detailVisible = ref(false)
const currentDetail = ref({})

// 发布弹窗状态
const publishVisible = ref(false)
const publishForm = ref({
  type: '',
  title: '',
  content: '',
  location: ''
})

// 评论抽屉状态
const commentVisible = ref(false)
const currentCommentPost = ref(null)
const commentText = ref('')
const sendingComment = ref(false)

// 当前帖子的评论列表
const currentComments = computed(() => {
  if (!currentCommentPost.value) return []
  return communityStore.getComments(currentCommentPost.value.id)
})

// 格式化时间
function formatTime(publishTime) {
  if (!publishTime) return ''
  try {
    return formatRelativeTime(publishTime)
  } catch (e) {
    return ''
  }
}

// 生命周期
onShow(() => {
  communityStore.fetchAnnouncements()
})

// 重新加载
function retryLoad() {
  communityStore.fetchAnnouncements()
}

// 搜索
function onSearchTap() {
  uni.showToast({ title: '搜索功能开发中', icon: 'none' })
}

// 打开发布弹窗
function onPublish() {
  publishForm.value = {
    type: '',
    title: '',
    content: '',
    location: ''
  }
  publishVisible.value = true
}

function closePublish() {
  publishVisible.value = false
}

// 提交帖子
function onSubmitPost() {
  if (communityStore.submitting) return

  const { type, title, content } = publishForm.value
  if (!type) {
    uni.showToast({ title: '请选择帖子分类', icon: 'none' })
    return
  }
  if (!title.trim()) {
    uni.showToast({ title: '请输入帖子标题', icon: 'none' })
    return
  }
  if (!content.trim()) {
    uni.showToast({ title: '请输入正文内容', icon: 'none' })
    return
  }

  communityStore.submitPost({
    type: type,
    title: title.trim(),
    content: content.trim(),
    location: publishForm.value.location.trim()
  }).then(() => {
    uni.showToast({ title: '发布成功', icon: 'success' })
    closePublish()
  }).catch(() => {
    uni.showToast({ title: '发布失败，请重试', icon: 'none' })
  })
}

// 点击帖子 → 弹出详情
function onPostTap(post) {
  currentDetail.value = post
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
}

// 点赞
function onLikeTap(post) {
  communityStore.toggleLike(post.id)
}

// 打开评论抽屉
function onCommentTap(post) {
  currentCommentPost.value = post
  commentText.value = ''
  commentVisible.value = true
  communityStore.fetchComments(post.id)
}

function closeComment() {
  commentVisible.value = false
}

// 发送评论
function onSendComment() {
  if (sendingComment.value) return
  const text = commentText.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入评论内容', icon: 'none' })
    return
  }
  if (!currentCommentPost.value) return

  sendingComment.value = true
  communityStore.addComment(currentCommentPost.value.id, text).then(() => {
    commentText.value = ''
    sendingComment.value = false
  }).catch(() => {
    uni.showToast({ title: '发送失败', icon: 'none' })
    sendingComment.value = false
  })
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-community {
  width: 100%;
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: calc(#{$tab-bar-height} + #{$safe-bottom});
}

/* ========== 自定义导航 ========== */
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
      position: absolute;
      right: 32rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 72rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .nav-search-icon {
        font-size: 38rpx;
      }
    }
  }
}

/* ========== Tab 行 ========== */
.tab-scroll {
  white-space: nowrap;
  border-bottom: 1rpx solid $border-color;

  .tab-list {
    display: inline-flex;
    padding: 0 16rpx;
    gap: 0;
  }
}

.tab-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  padding: 0 28rpx;
  position: relative;
  transition: all 0.25s;

  .tab-text {
    font-size: $font-size-sm;
    color: $text-muted;
    white-space: nowrap;
    transition: color 0.25s;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 4rpx;
    border-radius: 2rpx;
    background-color: $brand-primary;
    transition: width 0.25s;
  }

  &.active {
    .tab-text {
      color: $brand-primary;
      font-weight: 600;
    }

    &::after {
      width: 48rpx;
    }
  }
}

/* ========== 浮动发布按钮 ========== */
.publish-fab {
  position: fixed;
  right: 32rpx;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: linear-gradient(135deg, $color-primary-400 0%, $brand-primary 100%);
  padding: 16rpx 32rpx;
  border-radius: $radius-full;
  box-shadow: 0 8rpx 24rpx rgba(255, 130, 16, 0.35);

  &:active {
    opacity: 0.85;
    transform: scale(0.96);
  }

  .fab-plus {
    font-size: 32rpx;
    color: #ffffff;
    font-weight: 700;
    line-height: 1;
  }

  .fab-label {
    font-size: $font-size-sm;
    color: #ffffff;
    font-weight: 600;
    white-space: nowrap;
  }
}

/* ========== 帖子列表 ========== */
.post-list {
  padding: 0 24rpx;
}

.post-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx 28rpx 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid $border-color;
  box-shadow: $shadow-sm;
  position: relative;
  overflow: hidden;

  &.post-urgent {
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4rpx;
      background-color: $state-error;
    }
  }

  &:active {
    background-color: $color-neutral-100;
  }
}

/* 用户行 */
.post-user-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .post-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .avatar-char {
      font-size: 28rpx;
      color: #ffffff;
      font-weight: 600;
    }
  }

  .post-user-info {
    flex: 1;
    margin-left: 16rpx;

    .post-author {
      font-size: $font-size-sm;
      color: $text-primary;
      font-weight: 600;
    }
  }

  .post-time {
    font-size: $font-size-xs;
    color: $text-muted;
    flex-shrink: 0;
  }
}

/* 标签 */
.post-tag-row {
  margin-bottom: 16rpx;
}

.post-tag {
  display: inline-flex;
  align-items: center;
  height: 44rpx;
  padding: 0 18rpx;
  border-radius: $radius-full;

  .post-tag-text {
    font-size: $font-size-xs;
    font-weight: 500;
  }
}

/* 标题 */
.post-title {
  display: block;
  font-size: $font-size-base;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.5;
  margin-bottom: 12rpx;
}

/* 内容 */
.post-content {
  display: block;
  font-size: $font-size-sm;
  color: $text-secondary;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 20rpx;
}

/* 底部操作行 */
.post-actions {
  display: flex;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid $color-neutral-100;

  .action-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
    margin-right: 36rpx;

    .action-icon {
      font-size: 28rpx;

      &.liked {
        transform: scale(1.1);
      }
    }

    .action-count {
      font-size: $font-size-xs;
      color: $text-muted;

      &.liked {
        color: $state-error;
        font-weight: 600;
      }
    }

    &.like-btn, &.comment-btn {
      &:active {
        opacity: 0.6;
      }
    }
  }

  .action-location {
    margin-left: auto;
    margin-right: 0;

    .action-count {
      color: $text-muted;
    }
  }
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

  &.small {
    width: 40rpx;
    height: 40rpx;
    border-width: 4rpx;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: $font-size-base;
    color: $text-muted;
  }
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
    justify-content: space-between;
    margin-bottom: 20rpx;

    .detail-tag {
      display: inline-flex;
      align-items: center;
      height: 44rpx;
      padding: 0 18rpx;
      border-radius: $radius-full;
      font-size: $font-size-xs;
      font-weight: 500;
    }

    .detail-close {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .close-icon {
        font-size: 36rpx;
        color: $text-muted;
      }
    }
  }

  .detail-title {
    display: block;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.5;
    margin-bottom: 16rpx;
  }

  .detail-meta {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding-bottom: 20rpx;
    margin-bottom: 20rpx;
    border-bottom: 1rpx solid $color-neutral-100;

    .detail-author {
      font-size: $font-size-sm;
      color: $brand-primary;
      font-weight: 600;
    }

    .detail-time {
      font-size: $font-size-xs;
      color: $text-muted;
    }

    .detail-location {
      font-size: $font-size-xs;
      color: $text-muted;
      margin-left: auto;
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

/* ========== 发布弹窗 ========== */
.publish-popup {
  width: 100%;
  max-height: 85vh;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20rpx;
    margin-bottom: 20rpx;
    border-bottom: 1rpx solid $color-neutral-100;

    .publish-title {
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

      .close-icon {
        font-size: 36rpx;
        color: $text-muted;
      }
    }
  }

  .publish-body {
    flex: 1;
    min-height: 0;
  }
}

/* 表单 */
.form-section {
  margin-bottom: 24rpx;

  .form-label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 12rpx;

    .required {
      color: $state-error;
    }
  }
}

.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.type-chip {
  padding: 12rpx 28rpx;
  background-color: $color-neutral-100;
  border-radius: $radius-full;
  border: 2rpx solid transparent;

  .type-chip-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  &.active {
    background-color: rgba(255, 130, 16, 0.1);
    border-color: $brand-primary;

    .type-chip-text {
      color: $brand-primary;
      font-weight: 600;
    }
  }
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: $color-neutral-100;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  color: $text-primary;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx 24rpx;
  background-color: $color-neutral-100;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  color: $text-primary;
  box-sizing: border-box;
  line-height: 1.6;
}

.input-placeholder {
  color: $text-muted;
}

.publish-footer {
  padding-top: 20rpx;
  border-top: 1rpx solid $color-neutral-100;

  .submit-btn {
    height: 88rpx;
    background: linear-gradient(135deg, $color-primary-400 0%, $brand-primary 100%);
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.85;
    }

    &.disabled {
      opacity: 0.5;
    }

    .submit-text {
      font-size: $font-size-base;
      color: #ffffff;
      font-weight: 600;
    }
  }
}

/* ========== 评论抽屉 ========== */
.comment-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.comment-drawer {
  width: 100%;
  max-height: 75vh;
  background-color: $bg-card;
  border-radius: $radius-lg $radius-lg 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom);

  .comment-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid $color-neutral-100;

    .comment-title {
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

      .close-icon {
        font-size: 36rpx;
        color: $text-muted;
      }
    }
  }
}

.comment-list {
  flex: 1;
  min-height: 0;
  padding: 16rpx 32rpx;
}

.comment-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 80rpx 0;

  .state-text {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.comment-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 80rpx 0;

  .empty-icon {
    font-size: 64rpx;
  }

  .empty-text {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 8rpx 0;
}

.comment-item {
  display: flex;
  gap: 16rpx;

  .comment-avatar {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .avatar-char {
      font-size: 24rpx;
      color: #ffffff;
      font-weight: 600;
    }
  }

  .comment-body {
    flex: 1;
    min-width: 0;

    .comment-meta {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 8rpx;

      .comment-author {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: 600;
      }

      .comment-time {
        font-size: $font-size-xs;
        color: $text-muted;
      }
    }

    .comment-content {
      display: block;
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.6;
      word-break: break-word;
    }
  }
}

.comment-input-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  border-top: 1rpx solid $color-neutral-100;

  .comment-input {
    flex: 1;
    height: 72rpx;
    padding: 0 24rpx;
    background-color: $color-neutral-100;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    color: $text-primary;
  }

  .send-btn {
    padding: 0 32rpx;
    height: 72rpx;
    background-color: $brand-primary;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.85;
    }

    &.disabled {
      opacity: 0.4;
    }

    .send-text {
      font-size: $font-size-sm;
      color: #ffffff;
      font-weight: 600;
    }
  }
}
</style>
