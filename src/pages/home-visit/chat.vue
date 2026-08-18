<template>
  <view class="page-chat">
    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-btn" @tap="goBack">
          <text class="nav-icon">&#x2190;</text>
        </view>
        <view class="nav-center">
          <view class="nav-avatar" :style="{ backgroundColor: otherUser.avatarColor }">
            <text class="nav-avatar-letter">{{ (otherUser.name || '?').charAt(0) }}</text>
          </view>
          <view class="nav-title-block">
            <text class="nav-name">{{ otherUser.name || '对方' }}</text>
            <text class="nav-sub" v-if="visit">{{ visit.catName }} · 上门喂养需求</text>
          </view>
        </view>
        <view class="nav-spacer"></view>
      </view>
    </view>

    <!-- 平台留痕提示条 -->
    <view class="archive-tip" :style="{ top: (statusBarHeight + 44) + 'px' }">
      <text class="archive-icon">&#x1F6E1;</text>
      <text class="archive-text">沟通记录已由平台留痕存档，可作为售后仲裁凭证</text>
    </view>

    <!-- 消息列表区 -->
    <scroll-view
      class="message-list"
      :style="{ paddingTop: (statusBarHeight + 44 + 56) + 'px' }"
      scroll-y
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
    >
      <view v-if="messages.length === 0" class="empty-msg">
        <text class="empty-msg-icon">&#x1F4AC;</text>
        <text class="empty-msg-text">暂无消息，开始沟通吧</text>
      </view>

      <template v-else>
        <view v-for="(msg, idx) in messages" :key="idx" class="msg-group">
          <!-- 时间分隔 -->
          <view class="time-divider">
            <text class="time-text">{{ formatTime(msg.createTime) }}</text>
          </view>

          <!-- 接收消息（对方，靠左） -->
          <view v-if="msg.senderId !== visitStore.currentUserId" class="msg-row msg-left">
            <view class="msg-avatar" :style="{ backgroundColor: otherUser.avatarColor }">
              <text class="msg-avatar-letter">{{ (msg.senderName || '?').charAt(0) }}</text>
            </view>
            <view class="msg-bubble bubble-left">
              <text class="msg-text">{{ msg.content }}</text>
            </view>
          </view>

          <!-- 发送消息（自己，靠右） -->
          <view v-else class="msg-row msg-right">
            <view class="msg-bubble bubble-right">
              <text class="msg-text-right">{{ msg.content }}</text>
            </view>
          </view>
        </view>
      </template>
      <view class="msg-bottom-pad"></view>
    </scroll-view>

    <!-- 底部输入栏 -->
    <view class="input-bar">
      <!-- 快捷服务标签行 -->
      <view class="quick-tags">
        <view v-for="(tag, idx) in quickTags" :key="idx" class="quick-tag" @tap="useQuickTag(tag)">
          <text class="quick-tag-text">{{ tag }}</text>
        </view>
      </view>
      <!-- 输入行 -->
      <view class="input-row">
        <view class="plus-btn">
          <text class="plus-icon">+</text>
        </view>
        <input
          class="msg-input"
          v-model="inputText"
          placeholder="输入消息..."
          placeholder-class="input-placeholder"
          confirm-type="send"
          @confirm="sendMessage"
        />
        <view class="send-btn" @tap="sendMessage">
          <text class="send-text">发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useVisitStore } from '@/store/visit'

const visitStore = useVisitStore()
const statusBarHeight = ref(44)
const visit = ref(null)
const messages = ref([])
const inputText = ref('')
const scrollTop = ref(0)

// 对方用户信息
const otherUser = computed(() => {
  if (!visit.value) return { name: '对方', avatarColor: '#ff8210' }
  const isOwner = visit.value.publisher?.id === visitStore.currentUserId
  // 若当前用户是发布者，对方为接单人；否则对方为发布者
  if (isOwner && visit.value.visitor) {
    return {
      name: visit.value.visitor.name,
      avatarColor: visit.value.visitor.avatarColor
    }
  }
  return {
    name: visit.value.publisher?.name || '对方',
    avatarColor: visit.value.publisher?.avatarColor || '#ff8210'
  }
})

// 快捷服务标签
const quickTags = ['约定上门时间', '喂养禁忌', '钥匙交接']

onLoad((options) => {
  const id = options.id
  visitStore.initMockData()
  visit.value = visitStore.getVisitById(id)
  if (visit.value) {
    messages.value = safeGetMessages(id)
    scrollToBottom()
  }
  // 系统信息，适配状态栏
  try {
    const sys = uni.getSystemInfoSync()
    statusBarHeight.value = sys.statusBarHeight || 44
  } catch (e) {}
})

// 安全获取消息列表（兼容 store 未提供方法的情况）
function safeGetMessages(id) {
  if (typeof visitStore.getMessages === 'function') {
    const list = visitStore.getMessages(id)
    if (list && list.length) return list
  }
  // 兜底：使用 visit 自带的消息
  if (visit.value && visit.value.messages && visit.value.messages.length) {
    return visit.value.messages
  }
  return []
}

function goBack() {
  uni.navigateBack({ delta: 1, fail: () => uni.switchTab({ url: '/pages/index/index' }) })
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text || !visit.value) return
  // 兼容 store 未提供方法的情况：本地直接追加
  if (typeof visitStore.sendMessage === 'function') {
    visitStore.sendMessage(visit.value.id, text)
  } else {
    const now = new Date()
    messages.value = [...messages.value, {
      id: 'msg_' + now.getTime(),
      senderId: visitStore.currentUserId,
      senderName: '我',
      content: text,
      createTime: now.toISOString()
    }]
  }
  messages.value = safeGetMessages(visit.value.id)
  inputText.value = ''
  scrollToBottom()
}

function useQuickTag(tag) {
  inputText.value = tag
}

function scrollToBottom() {
  nextTick(() => {
    scrollTop.value = messages.value.length * 200 + 1
  })
}

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return '今天 ' + h + ':' + m
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-chat {
  width: 100%;
  height: 100vh;
  background-color: $bg-page;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 自定义导航栏 */
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
    padding: 0 24rpx;
  }
  .nav-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  .nav-icon {
    font-size: 44rpx;
    color: $text-primary;
  }
  .nav-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
  }
  .nav-avatar {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .nav-avatar-letter {
    color: #fff;
    font-size: $font-size-sm;
    font-weight: bold;
  }
  .nav-title-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2rpx;
  }
  .nav-name {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }
  .nav-sub {
    font-size: $font-size-xs;
    color: $text-muted;
  }
  .nav-spacer {
    width: 64rpx;
  }
}

/* 平台留痕提示条 */
.archive-tip {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 99;
  padding: 16rpx 28rpx;
  background-color: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  gap: 8rpx;
  .archive-icon {
    font-size: $font-size-sm;
  }
  .archive-text {
    font-size: $font-size-xs;
    color: $state-info;
  }
}

/* 消息列表 */
.message-list {
  flex: 1;
  box-sizing: border-box;
  padding: 24rpx 24rpx 0;
  height: calc(100vh - 88rpx);
}

.empty-msg {
  padding: 120rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  .empty-msg-icon {
    font-size: 96rpx;
  }
  .empty-msg-text {
    font-size: $font-size-base;
    color: $text-muted;
  }
}

.msg-group {
  margin-bottom: 24rpx;
}

.time-divider {
  display: flex;
  justify-content: center;
  margin-bottom: 16rpx;
  .time-text {
    font-size: $font-size-xs;
    color: $text-muted;
    background-color: rgba(0, 0, 0, 0.04);
    padding: 4rpx 16rpx;
    border-radius: $radius-full;
  }
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.msg-left {
  justify-content: flex-start;
}

.msg-right {
  justify-content: flex-end;
}

.msg-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  .msg-avatar-letter {
    color: #fff;
    font-size: $font-size-sm;
    font-weight: bold;
  }
}

.msg-bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  border-radius: $radius-lg;
  word-break: break-all;

  &.bubble-left {
    background-color: $bg-card;
    border: 1rpx solid $border-color;
    border-top-left-radius: $radius-sm;
    .msg-text {
      font-size: $font-size-sm;
      color: $text-primary;
      line-height: 1.5;
    }
  }
  &.bubble-right {
    background-color: $brand-primary;
    border-top-right-radius: $radius-sm;
    .msg-text-right {
      font-size: $font-size-sm;
      color: #fff;
      line-height: 1.5;
    }
  }
}

.msg-bottom-pad {
  height: 40rpx;
}

/* 底部输入栏 */
.input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $bg-card;
  border-top: 1rpx solid $border-color;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  z-index: 100;
}

.quick-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  .quick-tag {
    flex-shrink: 0;
    padding: 8rpx 20rpx;
    background-color: $color-neutral-100;
    border-radius: $radius-full;
  }
  .quick-tag-text {
    font-size: $font-size-xs;
    color: $text-secondary;
    white-space: nowrap;
  }
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12rpx;

  .plus-btn {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background-color: $color-neutral-100;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .plus-icon {
    font-size: 40rpx;
    color: $text-muted;
  }

  .msg-input {
    flex: 1;
    height: 72rpx;
    padding: 0 24rpx;
    background-color: $color-neutral-50;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    color: $text-primary;
    box-sizing: border-box;
  }
  .input-placeholder {
    color: $text-muted;
  }

  .send-btn {
    width: 112rpx;
    height: 72rpx;
    border-radius: $radius-full;
    background-color: $brand-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .send-text {
    font-size: $font-size-sm;
    color: #fff;
    font-weight: 600;
  }
}
</style>
