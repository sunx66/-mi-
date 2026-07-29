import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 当前用户标识（与 community store 保持一致）
export const CURRENT_USER = {
  id: 'user_001',
  name: '暖喵志愿者',
  avatar: '',
  avatarColor: '#ff8210'
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    id: '',
    nickname: '暖喵达人',
    avatar: '',
    joinDays: 0,
    joinDate: ''
  })
  const isLoggedIn = ref(false)

  // 收藏的猫咪点位（存 catId 数组）
  const favoriteCats = ref([])

  const isLoggedInComputed = computed(() => isLoggedIn.value)

  function initMockUser() {
    // 计算首次使用至今的天数（mock: 2026-03-24 注册）
    const joinDate = '2026-03-24'
    const joinTime = new Date(joinDate).getTime()
    const today = new Date()
    const todayTime = new Date(today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0')).getTime()
    const days = Math.max(1, Math.floor((todayTime - joinTime) / 86400000) + 1)

    userInfo.value = {
      id: CURRENT_USER.id,
      nickname: CURRENT_USER.name,
      avatar: CURRENT_USER.avatar,
      avatarColor: CURRENT_USER.avatarColor,
      joinDays: days,
      joinDate: joinDate
    }
    isLoggedIn.value = true
    // mock 初始收藏：小橘、大黑
    favoriteCats.value = ['cat_001', 'cat_003']
  }

  function updateProfile(data) {
    Object.assign(userInfo.value, data)
  }

  /**
   * 判断是否已收藏
   */
  function isFavorite(catId) {
    return favoriteCats.value.includes(catId)
  }

  /**
   * 切换收藏状态
   * @returns {boolean} 切换后状态（true=已收藏）
   */
  function toggleFavorite(catId) {
    const idx = favoriteCats.value.indexOf(catId)
    if (idx === -1) {
      favoriteCats.value.push(catId)
      return true
    } else {
      favoriteCats.value.splice(idx, 1)
      return false
    }
  }

  return {
    userInfo,
    isLoggedIn,
    isLoggedInComputed,
    favoriteCats,
    initMockUser,
    updateProfile,
    isFavorite,
    toggleFavorite
  }
})
