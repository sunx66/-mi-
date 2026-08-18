<template>
  <view class="page-home-visit">
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-btn" @tap="goBack">
          <text class="nav-icon">&#x2190;</text>
        </view>
        <view class="nav-title-area">
          <text class="nav-title">上门喂猫</text>
        </view>
        <view class="nav-spacer"></view>
      </view>
      <scroll-view class="tab-scroll" scroll-x :show-scrollbar="false">
        <view class="tab-list">
          <view v-for="tab in tabList" :key="tab.value" class="tab-item" :class="{ active: visitStore.activeTab === tab.value }" @tap="visitStore.setTab(tab.value)">
            <text class="tab-text">{{ tab.label }}</text>
            <text v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="create-fab" :style="{ top: fabTop + 'px' }" @tap="onCreate">
      <text class="fab-plus">+</text>
      <text class="fab-label">发起预约</text>
    </view>

    <view class="visit-list" :style="{ paddingTop: listTop + 'px' }">
      <view v-if="visits.length === 0" class="empty-state">
        <text class="empty-icon">🐱</text>
        <text class="empty-text">{{ visitStore.activeTab === 'nearby' ? '附近暂无可接单的预约' : '你还没有发起过预约' }}</text>
        <view v-if="visitStore.activeTab === 'mine'" class="empty-btn" @tap="onCreate">
          <text class="empty-btn-text">发起第一个预约</text>
        </view>
      </view>

      <template v-else>
        <view v-for="visit in visits" :key="visit.id" class="visit-card" :class="['visit-' + visit.status]">
          <view class="status-bar" :class="'bar-' + visit.status">
            <text class="status-text">{{ getStatusLabel(visit.status) }}</text>
            <text class="status-time" v-if="visit.visitTimeLabel">{{ visit.visitTimeLabel }}</text>
          </view>

          <view class="cat-row">
            <view class="cat-avatar" :style="{ backgroundColor: visit.catAvatarColor }">
              <text class="cat-letter">{{ visit.catName.charAt(0) }}</text>
            </view>
            <view class="cat-info">
              <text class="cat-name">{{ visit.catName }}</text>
              <text class="cat-address">&#x1F4CD; {{ visit.address }}</text>
            </view>
            <view v-if="visit.reward" class="reward-tag">
              <text class="reward-text">&#x1F381; {{ visit.reward }}</text>
            </view>
          </view>

          <view class="food-section">
            <text class="food-title">投喂清单</text>
            <view class="food-tag-list">
              <view v-for="(food, idx) in visit.foodList" :key="idx" class="food-tag">
                <text class="food-tag-name">{{ food.name }}</text>
                <text class="food-tag-weight" v-if="food.weight">{{ food.weight }}g</text>
              </view>
            </view>
          </view>

          <view v-if="visit.remark" class="remark-section">
            <text class="remark-label">备注</text>
            <text class="remark-text">{{ visit.remark }}</text>
          </view>

          <view class="participant-row">
            <view class="participant-block">
              <text class="participant-label">发起人</text>
              <view class="participant-user">
                <view class="mini-avatar" :style="{ backgroundColor: visit.publisher.avatarColor }">
                  <text class="mini-avatar-letter">{{ visit.publisher.name.charAt(0) }}</text>
                </view>
                <text class="participant-name">{{ visit.publisher.name }}</text>
              </view>
            </view>
            <view v-if="visit.visitor" class="participant-block">
              <text class="participant-label">接单人</text>
              <view class="participant-user">
                <view class="mini-avatar" :style="{ backgroundColor: visit.visitor.avatarColor }">
                  <text class="mini-avatar-letter">{{ visit.visitor.name.charAt(0) }}</text>
                </view>
                <text class="participant-name">{{ visit.visitor.name }}</text>
              </view>
            </view>
          </view>

          <view class="contact-row" v-if="visitStore.activeTab === 'mine' || (visit.visitor && visit.visitor.id === visitStore.currentUserId)">
            <text class="contact-icon">&#x1F4DE;</text>
            <text class="contact-text">{{ visit.contact }}</text>
          </view>

          <view class="action-row">
            <template v-if="visitStore.activeTab === 'nearby' && visit.status === 'pending'">
              <view class="btn btn-primary" @tap.stop="onAccept(visit)">
                <text class="btn-text">我来接单</text>
              </view>
            </template>
            <template v-if="visitStore.activeTab === 'mine'">
              <view v-if="visit.status === 'pending'" class="btn btn-ghost" @tap.stop="onCancel(visit)">
                <text class="btn-text">取消预约</text>
              </view>
              <template v-else-if="visit.status === 'accepted'">
                <view class="btn btn-ghost" @tap.stop="onCancel(visit)">
                  <text class="btn-text">取消</text>
                </view>
                <view class="btn btn-primary" @tap.stop="onComplete(visit)">
                  <text class="btn-text">确认完成</text>
                </view>
              </template>
              <view v-else-if="visit.status === 'completed' || visit.status === 'cancelled'" class="btn btn-ghost" @tap.stop="onNavigate(visit)">
                <text class="btn-text">&#x1F5FA; 查看位置</text>
              </view>
            </template>
          </view>
        </view>
      </template>
    </view>

    <view v-if="formVisible" class="form-mask" @tap="closeForm">
      <view class="form-popup" @tap.stop>
        <view class="form-header">
          <text class="form-title">发起上门喂猫预约</text>
          <view class="form-close" @tap="closeForm">
            <text class="close-icon">&#x2715;</text>
          </view>
        </view>
        <scroll-view class="form-scroll" scroll-y :show-scrollbar="false">
          <view class="form-body">
            <view class="form-section">
              <text class="form-label">选择猫咪</text>
              <view class="cat-select-list">
                <view v-for="cat in catOptions" :key="cat.id" class="cat-select-item" :class="{ 'cat-select-active': form.catId === cat.id }" @tap="selectCat(cat)">
                  <view class="cat-select-avatar" :style="{ backgroundColor: cat.avatarColor }">
                    <text class="cat-select-letter">{{ cat.name.charAt(0) }}</text>
                  </view>
                  <text class="cat-select-name">{{ cat.name }}</text>
                </view>
              </view>
              <text v-if="formError.catId" class="form-error">{{ formError.catId }}</text>
            </view>

            <view class="form-section">
              <text class="form-label">上门时间</text>
              <picker mode="date" :value="form.date" :end="maxDate" @change="onDateChange">
                <view class="form-picker">
                  <text class="picker-text" :class="{ 'placeholder': !form.date }">{{ form.date || '选择日期' }}</text>
                  <text class="picker-arrow">&#x25B6;</text>
                </view>
              </picker>
              <picker mode="time" :value="form.time" @change="onTimeChange">
                <view class="form-picker">
                  <text class="picker-text" :class="{ 'placeholder': !form.time }">{{ form.time || '选择时间' }}</text>
                  <text class="picker-arrow">&#x25B6;</text>
                </view>
              </picker>
              <text v-if="formError.visitTime" class="form-error">{{ formError.visitTime }}</text>
            </view>

            <view class="form-section">
              <text class="form-label">上门地点</text>
              <input class="form-input" v-model="form.address" placeholder="详细地址（街道、楼栋、明显标志）" placeholder-class="input-placeholder" :maxlength="100" />
              <view class="location-btn" @tap="useCurrentLocation">
                <text class="location-icon">&#x1F4CD;</text>
                <text class="location-text">使用当前位置</text>
              </view>
              <text v-if="formError.address" class="form-error">{{ formError.address }}</text>
            </view>

            <view class="form-section">
              <text class="form-label">投喂清单</text>
              <view class="food-input-list">
                <view v-for="(food, idx) in form.foodList" :key="idx" class="food-input-row">
                  <input class="food-name-input" v-model="food.name" placeholder="食物名称（如：猫粮）" placeholder-class="input-placeholder" :maxlength="20" />
                  <input class="food-weight-input" v-model.number="food.weight" type="number" placeholder="克重" placeholder-class="input-placeholder" />
                  <text class="weight-unit">g</text>
                  <view class="food-remove" @tap="removeFood(idx)">
                    <text class="remove-icon">&#x2715;</text>
                  </view>
                </view>
              </view>
              <view class="add-food-btn" @tap="addFood">
                <text class="add-food-icon">+ 添加食物</text>
              </view>
            </view>

            <view class="form-section">
              <text class="form-label">酬谢（可选）</text>
              <input class="form-input" v-model="form.reward" placeholder="如：猫条一包 / 顺便撸猫" placeholder-class="input-placeholder" :maxlength="50" />
            </view>

            <view class="form-section">
              <text class="form-label">联系方式</text>
              <input class="form-input" v-model="form.contact" placeholder="手机号 / App 内消息" placeholder-class="input-placeholder" :maxlength="30" />
              <text v-if="formError.contact" class="form-error">{{ formError.contact }}</text>
            </view>

            <view class="form-section">
              <text class="form-label">备注（可选）</text>
              <textarea class="form-textarea" v-model="form.remark" placeholder="猫咪习性、注意事项等" placeholder-class="input-placeholder" :maxlength="300" :auto-height="true" />
            </view>
          </view>
        </scroll-view>
        <view class="form-footer">
          <view class="submit-btn" :class="{ 'submit-disabled': submitting }" @tap="onSubmit">
            <text class="submit-text">{{ submitting ? '提交中...' : '发起预约' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useVisitStore } from '@/store/visit'
import { useCatStore } from '@/store/cat'
import { getLocation } from '@/utils/location'

const visitStore = useVisitStore()
const catStore = useCatStore()

const statusBarHeight = ref(44)
const navHeight = ref(44)
const fabTop = ref(120)
const listTop = ref(176)

const tabList = computed(() => [
  { value: 'nearby', label: '附近接单', count: visitStore.nearbyVisits.length },
  { value: 'mine', label: '我的预约', count: visitStore.myVisits.length }
])

const visits = computed(() => visitStore.filteredVisits)

const formVisible = ref(false)
const submitting = ref(false)

const form = ref({
  catId: '',
  catName: '',
  catAvatarColor: '#FFA726',
  date: '',
  time: '',
  visitTime: '',
  visitTimeLabel: '',
  address: '',
  latitude: null,
  longitude: null,
  foodList: [{ name: '', weight: null }],
  reward: '',
  contact: '',
  remark: ''
})

const formError = ref({})

const maxDate = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
})

const catOptions = computed(() => {
  return catStore.catList.map(cat => ({
    id: cat.id,
    name: cat.name,
    avatarColor: getAvatarColor(cat.name)
  }))
})

function getAvatarColor(name) {
  const colors = ['#FFA726', '#424242', '#FFE082', '#F5F5F5', '#212121']
  const idx = (name.charCodeAt(0) || 0) % colors.length
  return colors[idx]
}

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 44
    navHeight.value = 44
    fabTop.value = statusBarHeight.value + navHeight.value + 88 + 8
    listTop.value = statusBarHeight.value + navHeight.value + 88 + 20
  } catch (e) {}
  visitStore.initMockData()
  if (catStore.catList.length === 0) {
    catStore.initMockData()
  }
})

onShow(() => {
  visitStore.initMockData()
  if (catStore.catList.length === 0) {
    catStore.initMockData()
  }
})

function goBack() {
  uni.navigateBack({ delta: 1, fail: () => uni.switchTab({ url: '/pages/profile/index' }) })
}

function getStatusLabel(status) {
  const map = {
    pending: '待接单',
    accepted: '已接单',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

function onCreate() {
  form.value = {
    catId: '',
    catName: '',
    catAvatarColor: '#FFA726',
    date: '',
    time: '',
    visitTime: '',
    visitTimeLabel: '',
    address: '',
    latitude: null,
    longitude: null,
    foodList: [{ name: '', weight: null }],
    reward: '',
    contact: '',
    remark: ''
  }
  formError.value = {}
  formVisible.value = true
}

function closeForm() {
  if (submitting.value) return
  formVisible.value = false
}

function selectCat(cat) {
  form.value.catId = cat.id
  form.value.catName = cat.name
  form.value.catAvatarColor = cat.avatarColor
  if (formError.value.catId) formError.value.catId = ''
}

function onDateChange(e) {
  form.value.date = e.detail.value
}

function onTimeChange(e) {
  form.value.time = e.detail.value
}

function useCurrentLocation() {
  uni.showLoading({ title: '定位中...', mask: true })
  getLocation().then(loc => {
    form.value.latitude = loc.latitude
    form.value.longitude = loc.longitude
    uni.hideLoading()
    uni.showToast({ title: '坐标已获取，请补充地址', icon: 'none' })
  }).catch(() => {
    uni.hideLoading()
    uni.showToast({ title: '定位失败', icon: 'none' })
  })
}

function addFood() {
  form.value.foodList.push({ name: '', weight: null })
}

function removeFood(idx) {
  if (form.value.foodList.length === 1) {
    form.value.foodList[0] = { name: '', weight: null }
    return
  }
  form.value.foodList.splice(idx, 1)
}

function validateForm() {
  const err = {}
  if (!form.value.catId) err.catId = '请选择猫咪'
  if (!form.value.date || !form.value.time) err.visitTime = '请选择上门时间'
  if (!form.value.address || form.value.address.trim().length < 4) {
    err.address = '请填写详细地址（至少4个字）'
  }
  if (!form.value.contact || form.value.contact.trim().length < 2) {
    err.contact = '请填写联系方式'
  }
  formError.value = err
  return Object.keys(err).length === 0
}

function onSubmit() {
  if (submitting.value) return
  if (!validateForm()) {
    uni.showToast({ title: '请补全必填项', icon: 'none' })
    return
  }
  submitting.value = true
  const visitTime = form.value.date + 'T' + form.value.time + ':00'
  const visitTimeLabel = form.value.date.replace(/-/g, '月').replace(/^(\d+)月(\d+)/, '$1月$2日') + ' ' + form.value.time
  const foodList = form.value.foodList
    .filter(f => f.name && f.name.trim())
    .map(f => ({ name: f.name.trim(), weight: Number(f.weight) || 0 }))
  try {
    visitStore.createVisit({
      catId: form.value.catId,
      catName: form.value.catName,
      catAvatarColor: form.value.catAvatarColor,
      visitTime,
      visitTimeLabel,
      address: form.value.address.trim(),
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      foodList,
      reward: form.value.reward.trim(),
      contact: form.value.contact.trim(),
      remark: form.value.remark.trim()
    })
    visitStore.setTab('mine')
    formVisible.value = false
    submitting.value = false
    uni.showToast({ title: '预约已发起', icon: 'success' })
  } catch (e) {
    submitting.value = false
    uni.showToast({ title: '发起失败：' + e.message, icon: 'none' })
  }
}

function onAccept(visit) {
  uni.showModal({
    title: '确认接单',
    content: '将为「' + visit.catName + '」上门喂猫，时间：' + visit.visitTimeLabel,
    confirmText: '确认接单',
    confirmColor: '#FF8210',
    success: (res) => {
      if (res.confirm) {
        visitStore.acceptVisit(visit.id)
        visitStore.setTab('mine')
        uni.showToast({ title: '接单成功', icon: 'success' })
      }
    }
  })
}

function onComplete(visit) {
  uni.showModal({
    title: '确认完成',
    content: '完成后该预约将归档至历史记录',
    confirmText: '确认完成',
    confirmColor: '#22a860',
    success: (res) => {
      if (res.confirm) {
        visitStore.completeVisit(visit.id)
        uni.showToast({ title: '已完成', icon: 'success' })
      }
    }
  })
}

function onCancel(visit) {
  uni.showModal({
    title: '取消预约',
    content: '取消后无法恢复，确定继续？',
    confirmText: '取消预约',
    confirmColor: '#dc2626',
    success: (res) => {
      if (res.confirm) {
        visitStore.cancelVisit(visit.id)
        uni.showToast({ title: '已取消', icon: 'none' })
      }
    }
  })
}

function onNavigate(visit) {
  if (!visit.latitude || !visit.longitude) {
    uni.showToast({ title: '该预约无坐标信息', icon: 'none' })
    return
  }
  try {
    const { navigateToCat } = require('@/utils/mapNav')
    navigateToCat({
      latitude: visit.latitude,
      longitude: visit.longitude,
      name: visit.catName + ' 上门地点'
    })
  } catch (e) {
    uni.showToast({ title: '导航功能加载失败', icon: 'none' })
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.page-home-visit {
  width: 100%;
  min-height: 100vh;
  background-color: $bg-page;
  box-sizing: border-box;
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
  .tab-scroll {
    height: 80rpx;
  }
  .tab-list {
    display: flex;
    padding: 0 24rpx;
    height: 80rpx;
    align-items: center;
    gap: 8rpx;
  }
  .tab-item {
    display: flex;
    align-items: center;
    padding: 10rpx 24rpx;
    border-radius: $radius-full;
    background-color: $color-neutral-100;
    margin-right: 16rpx;
    flex-shrink: 0;

    &.active {
      background-color: $brand-primary;
      .tab-text { color: #fff; }
      .tab-badge { background-color: rgba(255,255,255,0.3); color: #fff; }
    }
  }
  .tab-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
  .tab-badge {
    margin-left: 8rpx;
    min-width: 28rpx;
    height: 28rpx;
    padding: 0 6rpx;
    border-radius: $radius-full;
    background-color: $color-neutral-300;
    color: #fff;
    font-size: 20rpx;
    line-height: 28rpx;
    text-align: center;
  }
}

.create-fab {
  position: fixed;
  right: 24rpx;
  width: 168rpx;
  height: 88rpx;
  border-radius: $radius-full;
  background-color: $brand-primary;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 130, 16, 0.4);
  z-index: 90;
  .fab-plus {
    font-size: 36rpx;
    font-weight: bold;
  }
  .fab-label {
    font-size: $font-size-sm;
  }
}

.visit-list {
  padding: 0 24rpx 160rpx;
  box-sizing: border-box;
  width: 100%;
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
  .empty-btn {
    margin-top: 24rpx;
    padding: 16rpx 48rpx;
    background-color: $brand-primary;
    color: #fff;
    border-radius: $radius-full;
  }
  .empty-btn-text {
    color: #fff;
    font-size: $font-size-sm;
  }
}

.visit-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 0;
  margin-bottom: 24rpx;
  border: 1rpx solid $border-color;
  box-shadow: $shadow-sm;
  overflow: hidden;

  &.visit-cancelled {
    opacity: 0.7;
  }
}

.status-bar {
  padding: 16rpx 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: $color-neutral-100;

  &.bar-pending { background-color: rgba(230, 138, 0, 0.08); }
  &.bar-accepted { background-color: rgba(255, 130, 16, 0.08); }
  &.bar-completed { background-color: rgba(34, 168, 96, 0.08); }
  &.bar-cancelled { background-color: rgba(220, 38, 38, 0.08); }

  .status-text {
    font-size: $font-size-sm;
    font-weight: 600;
  }
  .bar-pending .status-text { color: #e68a00; }
  .bar-accepted .status-text { color: $brand-primary; }
  .bar-completed .status-text { color: $state-success; }
  .bar-cancelled .status-text { color: $state-error; }

  .status-time {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.cat-row {
  display: flex;
  align-items: center;
  padding: 24rpx 28rpx;
  gap: 20rpx;

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
  .cat-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    min-width: 0;
  }
  .cat-name {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }
  .cat-address {
    font-size: $font-size-xs;
    color: $text-muted;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .reward-tag {
    flex-shrink: 0;
    background-color: rgba(255, 130, 16, 0.1);
    padding: 6rpx 16rpx;
    border-radius: $radius-full;
  }
  .reward-text {
    font-size: $font-size-xs;
    color: $brand-primary;
  }
}

.food-section {
  padding: 0 28rpx 20rpx;

  .food-title {
    font-size: $font-size-xs;
    color: $text-muted;
    display: block;
    margin-bottom: 12rpx;
  }
  .food-tag-list {
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

.remark-section {
  padding: 0 28rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;

  .remark-label {
    font-size: $font-size-xs;
    color: $text-muted;
  }
  .remark-text {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.participant-row {
  padding: 20rpx 28rpx;
  display: flex;
  gap: 40rpx;
  border-top: 1rpx solid $border-color;

  .participant-block {
    flex: 1;
  }
  .participant-label {
    font-size: $font-size-xs;
    color: $text-muted;
    display: block;
    margin-bottom: 10rpx;
  }
  .participant-user {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  .mini-avatar {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mini-avatar-letter {
    color: #fff;
    font-size: 22rpx;
    font-weight: bold;
  }
  .participant-name {
    font-size: $font-size-sm;
    color: $text-primary;
  }
}

.contact-row {
  padding: 12rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background-color: $color-neutral-50;

  .contact-icon {
    font-size: $font-size-sm;
  }
  .contact-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.action-row {
  padding: 16rpx 28rpx 24rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.btn {
  padding: 14rpx 36rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;

  &.btn-primary {
    background-color: $brand-primary;
    .btn-text { color: #fff; }
  }
  &.btn-ghost {
    background-color: transparent;
    border: 1rpx solid $border-color;
    .btn-text { color: $text-secondary; }
  }
  .btn-text {
    font-size: $font-size-sm;
    font-weight: 500;
  }
}

.form-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.form-popup {
  width: 100%;
  max-height: 88vh;
  background-color: $bg-card;
  border-radius: $radius-xl $radius-xl 0 0;
  display: flex;
  flex-direction: column;
}

.form-header {
  padding: 32rpx 28rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid $border-color;

  .form-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $text-primary;
  }
  .form-close {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .close-icon {
    font-size: 36rpx;
    color: $text-muted;
  }
}

.form-scroll {
  flex: 1;
  max-height: 60vh;
}

.form-body {
  padding: 24rpx 28rpx 40rpx;
}

.form-section {
  margin-bottom: 28rpx;
}

.form-label {
  font-size: $font-size-sm;
  color: $text-secondary;
  font-weight: 500;
  display: block;
  margin-bottom: 14rpx;
}

.form-error {
  font-size: $font-size-xs;
  color: $state-error;
  display: block;
  margin-top: 8rpx;
}

.cat-select-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.cat-select-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: $radius-full;
  background-color: $color-neutral-100;
  border: 2rpx solid transparent;

  &.cat-select-active {
    background-color: $brand-primary-light;
    border-color: $brand-primary;
  }
}
.cat-select-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cat-select-letter {
  color: #fff;
  font-size: 22rpx;
  font-weight: bold;
}
.cat-select-name {
  font-size: $font-size-sm;
  color: $text-primary;
}

.form-picker {
  padding: 20rpx 24rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  margin-bottom: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .picker-text {
    font-size: $font-size-base;
    color: $text-primary;
    &.placeholder { color: $text-muted; }
  }
  .picker-arrow {
    font-size: 20rpx;
    color: $text-muted;
  }
}

.form-input {
  width: 100%;
  padding: 20rpx 24rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  font-size: $font-size-base;
  color: $text-primary;
  box-sizing: border-box;
  margin-bottom: 12rpx;
}
.input-placeholder {
  color: $text-muted;
}

.location-btn {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  background-color: $brand-primary-light;
  border-radius: $radius-full;

  .location-icon {
    font-size: $font-size-sm;
  }
  .location-text {
    font-size: $font-size-xs;
    color: $brand-primary;
  }
}

.food-input-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.food-input-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.food-name-input {
  flex: 1;
  padding: 16rpx 20rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  color: $text-primary;
}
.food-weight-input {
  width: 120rpx;
  padding: 16rpx 20rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  color: $text-primary;
}
.weight-unit {
  font-size: $font-size-xs;
  color: $text-muted;
}
.food-remove {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.remove-icon {
  font-size: 28rpx;
  color: $state-error;
}

.add-food-btn {
  margin-top: 16rpx;
  padding: 16rpx;
  text-align: center;
  border: 2rpx dashed $border-color;
  border-radius: $radius-md;
}
.add-food-icon {
  font-size: $font-size-sm;
  color: $brand-primary;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx 24rpx;
  background-color: $color-neutral-50;
  border-radius: $radius-md;
  font-size: $font-size-base;
  color: $text-primary;
  box-sizing: border-box;
}

.form-footer {
  padding: 20rpx 28rpx 40rpx;
  border-top: 1rpx solid $border-color;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background-color: $brand-primary;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  &.submit-disabled {
    opacity: 0.6;
  }
  .submit-text {
    color: #fff;
    font-size: $font-size-base;
    font-weight: 600;
  }
}
</style>
