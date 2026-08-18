<template>
  <view class="page-detail">
    <!-- 自定义导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-btn" @tap="goBack">
          <text class="nav-icon">&#x2190;</text>
        </view>
        <view class="nav-title-area">
          <text class="nav-title">需求详情</text>
        </view>
        <view class="nav-spacer"></view>
      </view>
    </view>

    <!-- 主体内容 -->
    <view class="detail-body" :style="{ paddingTop: (statusBarHeight + 44) + 'px' }">
      <view v-if="!visit" class="empty-state">
        <text class="empty-icon">🐱</text>
        <text class="empty-text">需求不存在或已删除</text>
      </view>

      <template v-else>
        <!-- 状态横幅 -->
        <view class="status-banner" :class="'banner-' + visit.status">
          <text class="banner-icon">{{ statusIcon(visit.status) }}</text>
          <text class="banner-text">{{ statusLabel(visit.status) }}</text>
        </view>

        <!-- 发布者信息区 -->
        <view class="card publisher-card">
          <view class="publisher-row">
            <view class="publisher-avatar" :style="{ backgroundColor: visit.publisher.avatarColor }">
              <text class="avatar-letter">{{ (visit.publisher.name || '?').charAt(0) }}</text>
            </view>
            <view class="publisher-info">
              <view class="publisher-name-line">
                <text class="publisher-name">{{ visit.publisher.name }}</text>
              </view>
              <text class="publish-time">发布于 {{ visit.createTimeLabel || '未知' }}</text>
            </view>
          </view>

        </view>

        <!-- 需求标题与描述 -->
        <view class="card demand-card">
          <text class="demand-title">上门喂养「{{ visit.catName }}」</text>
          <text class="demand-desc">{{ visit.remark || '暂无描述' }}</text>

          <!-- 信息网格 2x2 -->
          <view class="info-grid">
            <view class="info-item">
              <text class="info-label">服务时间</text>
              <text class="info-value">{{ visit.visitTimeLabel || '待约定' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">猫咪数量</text>
              <text class="info-value">{{ catCountText }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">每日次数</text>
              <text class="info-value">{{ visit.dailyCount || 1 }} 次/日</text>
            </view>
            <view class="info-item">
              <text class="info-label">预算</text>
              <text class="info-value">{{ budgetText }}</text>
            </view>
          </view>
        </view>

        <!-- 服务套餐区 -->
        <view class="card package-card" v-if="packageInfo">
          <view class="section-header">
            <text class="section-title">服务套餐</text>
            <view class="package-tag">
              <text class="package-tag-text">{{ packageInfo.name }}</text>
            </view>
          </view>
          <view class="service-list">
            <view v-for="(service, idx) in packageInfo.services" :key="idx" class="service-item">
              <text class="service-check">&#x2713;</text>
              <text class="service-text">{{ service }}</text>
            </view>
          </view>
          <view class="lock-tip">
            <text class="lock-icon">&#x1F512;</text>
            <text class="lock-text">平台固定标准，不可自定义修改</text>
          </view>
        </view>

        <!-- 5项必填打卡交付 -->
        <view class="card checklist-card">
          <view class="section-header">
            <view class="section-title-block">
              <text class="section-title">服务打卡交付</text>
              <text class="section-subtitle">服务人员上传交付素材（必填）</text>
            </view>
          </view>
          <view class="checklist-grid">
            <view
              v-for="(item, index) in checklist"
              :key="index"
              class="checklist-item"
              :class="{ 'item-uploaded': item.uploaded, 'item-pending': !item.uploaded }"
              @tap="uploadChecklist(index)"
            >
              <text class="checklist-icon">{{ item.uploaded ? '&#x2713;' : '&#x2B;' }}</text>
              <text class="checklist-name">{{ item.name }}</text>
              <text class="checklist-status">{{ item.uploaded ? '已上传' : '待上传' }}</text>
            </view>
          </view>
          <view v-if="!allUploaded" class="checklist-warn">
            <text class="warn-icon">&#x26A0;</text>
            <text class="warn-text">未完成全部打卡上传，无法提交订单结算</text>
          </view>
        </view>

        <!-- 平台担保交易流程 -->
        <view class="card guarantee-card">
          <text class="section-title">平台担保交易流程</text>
          <view class="guarantee-steps">
            <view class="step-item">
              <view class="step-icon step-icon-1">
                <text class="step-emoji">&#x1F4B0;</text>
              </view>
              <text class="step-name">资金托管</text>
              <text class="step-desc">下单即托管</text>
            </view>
            <view class="step-arrow">
              <text class="arrow-text">&#x2192;</text>
            </view>
            <view class="step-item">
              <view class="step-icon step-icon-2">
                <text class="step-emoji">&#x2714;</text>
              </view>
              <text class="step-name">服务核验</text>
              <text class="step-desc">打卡验收</text>
            </view>
            <view class="step-arrow">
              <text class="arrow-text">&#x2192;</text>
            </view>
            <view class="step-item">
              <view class="step-icon step-icon-3">
                <text class="step-emoji">&#x1F911;</text>
              </view>
              <text class="step-name">平台放款</text>
              <text class="step-desc">核验后放款</text>
            </view>
          </view>
          <view class="guarantee-foot">
            <text class="foot-text">资金由平台托管，服务完成核验通过后才放款</text>
          </view>
        </view>

        
      <!-- 服务交付归档 -->
      <view class="detail-card" v-if="visit && visit.checklist">
        <text class="card-title">服务交付归档</text>
        <text class="card-subtitle">平台永久留存，售后仲裁唯一依据</text>
        <view class="archive-grid">
          <view v-for="item in checklist" :key="item.id" class="archive-item" :class="{ uploaded: item.uploaded }">
            <text class="archive-icon">{{ item.uploaded ? '✅' : '📷' }}</text>
            <text class="archive-name">{{ item.name }}</text>
          </view>
        </view>
        <view class="archive-footer" v-if="visit.status === 'completed'">
          <text class="archive-time">服务时间：{{ visit.visitTimeLabel || '已归档' }} · 打卡记录已归档留存</text>
        </view>
      </view>

<!-- 服务地址 -->
        <view class="card address-card">
          <view class="address-row">
            <text class="addr-icon">&#x1F4CD;</text>
            <view class="addr-info">
              <text class="addr-text">{{ visit.address }}</text>
              <text v-if="visit.distance" class="addr-distance">距您约 {{ visit.distance }}</text>
            </view>
          </view>
        </view>

        <!-- 猫咪信息 -->
        <view class="card cat-card">
          <view class="cat-info-row">
            <view class="cat-avatar" :style="{ backgroundColor: visit.catAvatarColor }">
              <text class="cat-letter">{{ (visit.catName || '?').charAt(0) }}</text>
            </view>
            <view class="cat-detail">
              <text class="cat-name">{{ visit.catName }}</text>
              <text class="cat-desc">{{ visit.remark || '暂无猫咪描述' }}</text>
            </view>
          </view>
          <view v-if="visit.foodList && visit.foodList.length" class="food-list">
            <text class="food-list-title">投喂清单</text>
            <view class="food-tags">
              <view v-for="(food, idx) in visit.foodList" :key="idx" class="food-tag">
                <text class="food-tag-name">{{ food.name }}</text>
                <text v-if="food.weight" class="food-tag-weight">{{ food.weight }}g</text>
              </view>
            </view>
          </view>
        </view>

        <view class="bottom-placeholder"></view>
      </template>
    </view>

    <!-- 底部固定操作栏 -->
    <view v-if="visit" class="action-bar">
      <view class="action-tip">
        <text class="tip-shield">&#x1F6E1;</text>
        <text class="tip-text">平台担保交易·资金托管中</text>
      </view>
      <view class="action-buttons">
        <view class="btn btn-outline" @tap="goToChat">
          <text class="btn-outline-text">立即沟通</text>
        </view>
        <view class="btn btn-solid" @tap="handleAccept">
          <text class="btn-solid-text">平台担保接单</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useVisitStore } from '@/store/visit'
// 使用 import * 安全导入，兼容 mock 未导出 PACKAGE_OPTIONS 的情况
import * as mockVisit from '@/mock/visit'

const visitStore = useVisitStore()
const statusBarHeight = ref(44)
const visit = ref(null)
const checklist = ref([])
const packageInfo = ref(null)

// 本地兜底套餐常量（防止 mock 未导出 PACKAGE_OPTIONS）
const LOCAL_PACKAGE_OPTIONS = {
  basic: { name: '基础喂养套餐', price: 80, services: ['上门添猫粮', '更换饮用水', '简单清理食具水具'] },
  standard: { name: '标准看护套餐', price: 120, services: ['添粮换水', '彻底铲屎', '周边环境简单整理', '拍摄宠物状态反馈图'] },
  premium: { name: '全套尊享套餐', price: 180, services: ['全套喂养清洁', '短时陪玩互动', '宠物精神状态观察', '全屋水电门窗安全巡检', '多维度服务实拍反馈'] }
}
// 优先使用 mock 导出的常量，否则用本地兜底
const PACKAGE_OPTIONS = mockVisit.PACKAGE_OPTIONS || LOCAL_PACKAGE_OPTIONS

// 当前用户是否为发布者
const isOwner = computed(() => visit.value?.publisher?.id === visitStore.currentUserId)

// 猫咪数量文案
const catCountText = computed(() => {
  if (!visit.value) return '1 只'
  return (visit.value.serviceDays || 1) + ' 只'
})

// 预算文案
const budgetText = computed(() => {
  if (!visit.value) return '面议'
  const price = visit.value.price
  if (price) return '¥' + price + '/日'
  if (packageInfo.value && packageInfo.value.price) return '¥' + packageInfo.value.price + '/日'
  return '面议'
})

// 是否全部打卡完成
const allUploaded = computed(() => checklist.value.length > 0 && checklist.value.every(item => item.uploaded))

onLoad((options) => {
  const id = options.id || options.requestId
  visitStore.initMockData()
  visit.value = visitStore.getVisitById(id)
  if (visit.value) {
    // 获取打卡项（兼容 store 未提供方法的情况）
    checklist.value = safeGetChecklist(id)
    // 获取套餐信息（兼容 store 未提供方法的情况）
    packageInfo.value = safeGetPackageInfo(visit.value.packageLevel)
  }
  // 系统信息，适配状态栏
  try {
    const sys = uni.getSystemInfoSync()
    statusBarHeight.value = sys.statusBarHeight || 44
  } catch (e) {}
})

// 安全获取打卡项
function safeGetChecklist(id) {
  if (typeof visitStore.getChecklistItems === 'function') {
    const items = visitStore.getChecklistItems(id)
    if (items && items.length) return items
  }
  // 兜底：使用 visit 自带的 checklist，或生成默认 5 项
  if (visit.value && visit.value.checklist && visit.value.checklist.length) {
    return visit.value.checklist
  }
  return [
    { id: 1, name: '到达签到', uploaded: false },
    { id: 2, name: '添粮换水', uploaded: false },
    { id: 3, name: '铲屎清理', uploaded: false },
    { id: 4, name: '猫咪状态', uploaded: false },
    { id: 5, name: '离开确认', uploaded: false }
  ]
}

// 安全获取套餐信息
function safeGetPackageInfo(level) {
  if (typeof visitStore.getPackageInfo === 'function') {
    const info = visitStore.getPackageInfo(level)
    if (info) return info
  }
  return PACKAGE_OPTIONS[level] || PACKAGE_OPTIONS.standard
}

function goBack() {
  uni.navigateBack({ delta: 1, fail: () => uni.switchTab({ url: '/pages/index/index' }) })
}

function goToChat() {
  if (visit.value) {
    uni.navigateTo({ url: '/pages/home-visit/chat?id=' + visit.value.id })
  }
}

function handleAccept() {
  uni.showModal({
    title: '确认接单',
    content: '确认平台担保接单？资金将由平台托管，服务完成核验后放款。',
    success: (res) => {
      if (res.confirm && visit.value) {
        visitStore.acceptVisit(visit.value.id)
        uni.showToast({ title: '接单成功', icon: 'success' })
        setTimeout(() => goBack(), 1000)
      }
    }
  })
}

function uploadChecklist(index) {
  if (!visit.value) return
  // 兼容 store 未提供方法的情况：本地直接更新
  if (typeof visitStore.uploadChecklistItem === 'function') {
    visitStore.uploadChecklistItem(visit.value.id, index)
  } else {
    if (checklist.value[index]) {
      checklist.value[index] = { ...checklist.value[index], uploaded: true }
    }
  }
  checklist.value = safeGetChecklist(visit.value.id)
}

function statusLabel(status) {
  const map = {
    pending: '待接单',
    accepted: '已接单',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

function statusIcon(status) {
  const map = {
    pending: '&#x23F3;',
    accepted: '&#x2705;',
    completed: '&#x1F3C6;',
    cancelled: '&#x274C;'
  }
  return map[status] || '&#x23F3;'
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-detail {
  width: 100%;
  min-height: 100vh;
  background-color: $bg-page;
  box-sizing: border-box;
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
  .nav-title-area {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  .nav-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-primary;
  }
  .nav-spacer {
    width: 64rpx;
  }
}

.detail-body {
  padding: 0 24rpx 200rpx;
  box-sizing: border-box;
}

.empty-state {
  padding: 120rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  .empty-icon {
    font-size: 96rpx;
  }
  .empty-text {
    font-size: $font-size-base;
    color: $text-muted;
  }
}

/* 状态横幅 */
.status-banner {
  margin: 24rpx 0;
  padding: 20rpx 28rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  gap: 12rpx;

  &.banner-pending {
    background-color: rgba(230, 138, 0, 0.1);
    .banner-text { color: $state-warning; }
    .banner-icon { color: $state-warning; }
  }
  &.banner-accepted {
    background-color: rgba(255, 130, 16, 0.1);
    .banner-text { color: $brand-primary; }
    .banner-icon { color: $brand-primary; }
  }
  &.banner-completed {
    background-color: rgba(34, 168, 96, 0.1);
    .banner-text { color: $state-success; }
    .banner-icon { color: $state-success; }
  }
  &.banner-cancelled {
    background-color: rgba(220, 38, 38, 0.1);
    .banner-text { color: $state-error; }
    .banner-icon { color: $state-error; }
  }
  .banner-icon {
    font-size: 36rpx;
  }
  .banner-text {
    font-size: $font-size-base;
    font-weight: 600;
  }
}

/* 通用卡片 */
.card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: $shadow-sm;
  box-sizing: border-box;
}

/* 发布者信息 */
.publisher-card {
  .publisher-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }
  .publisher-avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .avatar-letter {
    color: #fff;
    font-size: $font-size-lg;
    font-weight: bold;
  }
  .publisher-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }
  .publisher-name-line {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
  .publisher-name {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }
  .publish-time {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

/* 需求标题与描述 */
.demand-card {
  .demand-title {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $text-primary;
    display: block;
    margin-bottom: 12rpx;
  }
  .demand-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.6;
    display: block;
    margin-bottom: 24rpx;
  }
}

.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  .info-item {
    width: calc(50% - 8rpx);
    background-color: $color-neutral-50;
    padding: 20rpx;
    border-radius: $radius-md;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    box-sizing: border-box;
  }
  .info-label {
    font-size: $font-size-xs;
    color: $text-muted;
  }
  .info-value {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }
}

/* 服务套餐区 */
.package-card {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }
  .section-title {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }
  .package-tag {
    padding: 6rpx 20rpx;
    background-color: $brand-primary;
    border-radius: $radius-full;
  }
  .package-tag-text {
    font-size: $font-size-xs;
    color: #fff;
    font-weight: 500;
  }
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-bottom: 20rpx;
  .service-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  .service-check {
    font-size: $font-size-sm;
    color: $state-success;
    font-weight: bold;
  }
  .service-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.lock-tip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  .lock-icon {
    font-size: $font-size-sm;
  }
  .lock-text {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

/* 5项打卡 */
.checklist-card {
  .section-header {
    margin-bottom: 20rpx;
  }
  .section-title-block {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }
  .section-title {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }
  .section-subtitle {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.checklist-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  .checklist-item {
    width: calc(50% - 8rpx);
    padding: 24rpx 16rpx;
    border-radius: $radius-md;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    box-sizing: border-box;

    &.item-uploaded {
      background-color: rgba(34, 168, 96, 0.08);
      border: 2rpx solid $state-success;
      .checklist-icon { color: $state-success; }
      .checklist-status { color: $state-success; }
    }
    &.item-pending {
      background-color: $color-neutral-50;
      border: 2rpx dashed $border-color;
      .checklist-icon { color: $text-muted; }
      .checklist-status { color: $text-muted; }
    }
  }
  .checklist-icon {
    font-size: 36rpx;
    font-weight: bold;
  }
  .checklist-name {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: 500;
  }
  .checklist-status {
    font-size: $font-size-xs;
  }
}

.checklist-warn {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  background-color: rgba(220, 38, 38, 0.06);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  gap: 8rpx;
  .warn-icon {
    font-size: $font-size-sm;
    color: $state-error;
  }
  .warn-text {
    font-size: $font-size-xs;
    color: $state-error;
  }
}

/* 平台担保交易流程 */
.guarantee-card {
  .section-title {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
    display: block;
    margin-bottom: 24rpx;
  }
}

.guarantee-steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24rpx;
  .step-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
  }
  .step-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8rpx;

    &.step-icon-1 { background-color: rgba(59, 130, 246, 0.1); }
    &.step-icon-2 { background-color: rgba(255, 130, 16, 0.1); }
    &.step-icon-3 { background-color: rgba(34, 168, 96, 0.1); }
  }
  .step-emoji {
    font-size: 36rpx;
  }
  .step-name {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $text-primary;
  }
  .step-desc {
    font-size: $font-size-xs;
    color: $text-muted;
  }
  .step-arrow {
    padding-top: 24rpx;
  }
  .arrow-text {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.guarantee-foot {
  padding: 16rpx 20rpx;
  background-color: $brand-primary-light;
  border-radius: $radius-md;
  .foot-text {
    font-size: $font-size-xs;
    color: $brand-primary;
  }
}

/* 服务地址 */
.address-card {
  .address-row {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
  }
  .addr-icon {
    font-size: $font-size-base;
    flex-shrink: 0;
  }
  .addr-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }
  .addr-text {
    font-size: $font-size-sm;
    color: $text-primary;
    line-height: 1.5;
  }
  .addr-distance {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

/* 猫咪信息 */
.cat-card {
  .cat-info-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 24rpx;
  }
  .cat-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .cat-letter {
    color: #fff;
    font-size: $font-size-lg;
    font-weight: bold;
  }
  .cat-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }
  .cat-name {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }
  .cat-desc {
    font-size: $font-size-xs;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.food-list {
  padding-top: 20rpx;
  border-top: 1rpx solid $border-color;
  .food-list-title {
    font-size: $font-size-xs;
    color: $text-muted;
    display: block;
    margin-bottom: 12rpx;
  }
  .food-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }
  .food-tag {
    background-color: $brand-primary-light;
    padding: 8rpx 20rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
  .food-tag-name {
    font-size: $font-size-xs;
    color: $brand-primary;
    font-weight: 500;
  }
  .food-tag-weight {
    font-size: 20rpx;
    color: $text-muted;
  }
}

.bottom-placeholder {
  height: 40rpx;
}

/* 底部固定操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $bg-card;
  border-top: 1rpx solid $border-color;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
  z-index: 100;

  .action-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 8rpx 0 16rpx;
    .tip-shield {
      font-size: $font-size-sm;
    }
    .tip-text {
      font-size: $font-size-xs;
      color: $brand-primary;
      font-weight: 500;
    }
  }
  .action-buttons {
    display: flex;
    gap: 20rpx;
  }
  .btn {
    flex: 1;
    height: 88rpx;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;

    &.btn-outline {
      background-color: transparent;
      border: 2rpx solid $brand-primary;
      .btn-outline-text {
        color: $brand-primary;
        font-size: $font-size-base;
        font-weight: 600;
      }
    }
    &.btn-solid {
      background-color: $brand-primary;
      box-shadow: 0 8rpx 24rpx rgba(255, 130, 16, 0.3);
      .btn-solid-text {
        color: #fff;
        font-size: $font-size-base;
        font-weight: 600;
      }
    }
  }
}

/* 归档区块 */
.archive-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; margin-top: 16rpx; }
.archive-item { aspect-ratio: 1; border-radius: $radius-md; background: $bg-page; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8rpx;
  &.uploaded { background: rgba(34, 168, 96, 0.08); border: 2rpx solid rgba(34, 168, 96, 0.3); }
}
.archive-icon { font-size: 36rpx; }
.archive-name { font-size: 20rpx; color: $text-muted; text-align: center; }
.archive-footer { margin-top: 16rpx; .archive-time { font-size: 22rpx; color: $text-muted; } }
.card-subtitle { font-size: 24rpx; color: $text-muted; display: block; margin-bottom: 12rpx; }

</style>
