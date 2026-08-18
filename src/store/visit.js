import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockVisitList } from '../mock/visit'

// 当前用户标识（mock）
const CURRENT_USER = {
  id: 'user_001',
  name: '暖喵志愿者',
  avatarColor: '#ff8210'
}

/**
 * 上门喂猫预约 store
 *
 * 状态流转：pending（待接单）→ accepted（已接单）→ completed（已完成）
 *                 └→ cancelled（已取消，任意阶段可取消）
 *
 * 数据修改必须通过 action 方法，禁止直接修改 state
 */
export const useVisitStore = defineStore('visit', () => {
  // 全部预约（包含他人发起的，用于"接单市场"展示）
  const visitList = ref([])
  // 当前激活 tab：nearby（附近接单）/ mine（我的预约）
  const activeTab = ref('nearby')

  // 当前用户 ID（mock）
  const currentUserId = ref(CURRENT_USER.id)

  // ============ computed ============

  // 附近可接单的预约（排除自己发起的、非 pending 的）
  const nearbyVisits = computed(() => {
    return visitList.value.filter(
      v => v.publisher.id !== currentUserId.value && v.status === 'pending'
    )
  })

  // 我的预约（我发起的 或 我接单的）
  const myVisits = computed(() => {
    return visitList.value.filter(v => {
      return (
        v.publisher.id === currentUserId.value ||
        (v.visitor && v.visitor.id === currentUserId.value)
      )
    })
  })

  // 当前 tab 过滤后的列表
  const filteredVisits = computed(() => {
    return activeTab.value === 'nearby' ? nearbyVisits.value : myVisits.value
  })

  // 统计
  const pendingCount = computed(() =>
    visitList.value.filter(v => v.status === 'pending').length
  )
  const acceptedCount = computed(() =>
    visitList.value.filter(v => v.status === 'accepted').length
  )
  const completedCount = computed(() =>
    visitList.value.filter(v => v.status === 'completed').length
  )

  // ============ actions ============

  function initMockData() {
    if (visitList.value.length === 0) {
      visitList.value = JSON.parse(JSON.stringify(mockVisitList))
      console.log('[visitStore] initMockData:', visitList.value.length, 'visits')
    }
  }

  function setTab(tab) {
    activeTab.value = tab
  }

  function getVisitById(id) {
    return visitList.value.find(v => v.id === id)
  }

  /**
   * 创建预约
   * @param {Object} payload - 预约数据
   * @returns {Object} 新建的预约（含生成的 id）
   */
  function createVisit(payload) {
    const now = new Date()
    const newVisit = {
      id: 'visit_' + (now.getTime() % 1000000),
      catId: payload.catId,
      catName: payload.catName,
      catAvatarColor: payload.catAvatarColor || '#FFA726',
      status: 'pending',
      publisher: { ...CURRENT_USER },
      visitor: null,
      visitTime: payload.visitTime,
      visitTimeLabel: payload.visitTimeLabel || payload.visitTime,
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
      contact: payload.contact,
      foodList: payload.foodList || [],
      remark: payload.remark || '',
      reward: payload.reward || '',
      createTime: now.toISOString(),
      createTimeLabel: '刚刚'
    }
    visitList.value = [newVisit, ...visitList.value]
    console.log('[visitStore] createVisit:', newVisit.id)
    return newVisit
  }

  /**
   * 接单
   */
  function acceptVisit(id) {
    visitList.value = visitList.value.map(v =>
      v.id === id && v.status === 'pending'
        ? { ...v, status: 'accepted', visitor: { ...CURRENT_USER } }
        : v
    )
    console.log('[visitStore] acceptVisit:', id)
  }

  /**
   * 完成预约
   */
  function completeVisit(id) {
    visitList.value = visitList.value.map(v =>
      v.id === id && v.status === 'accepted'
        ? { ...v, status: 'completed' }
        : v
    )
    console.log('[visitStore] completeVisit:', id)
  }

  /**
   * 取消预约（仅 pending / accepted 可取消）
   */
  function cancelVisit(id) {
    visitList.value = visitList.value.map(v =>
      v.id === id && (v.status === 'pending' || v.status === 'accepted')
        ? { ...v, status: 'cancelled' }
        : v
    )
    console.log('[visitStore] cancelVisit:', id)
  }

  return {
    // state
    visitList,
    activeTab,
    currentUserId,
    // computed
    nearbyVisits,
    myVisits,
    filteredVisits,
    pendingCount,
    acceptedCount,
    completedCount,
    // actions
    initMockData,
    setTab,
    getVisitById,
    createVisit,
    acceptVisit,
    completeVisit,
    cancelVisit
  }
})
