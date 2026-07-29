import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockCatList } from '../mock/cat'
import { calcDistance } from '../utils/location'
import { formatRelativeTime } from '../utils/format' 

export const useCatStore = defineStore('cat', () => {
  const catList = ref([])
  const currentCat = ref(null)
  const nearbyCats = ref([])
  const activeFilter = ref('all')
  const searchKeyword = ref('')
  const range = ref(3)
  const userLocation = ref({ latitude: 38.2994, longitude: 116.9816 })

  function initMockData() {
    if (catList.value.length > 0) {
      catList.value = catList.value.map(cat => ({
        ...cat,
        distance: calcDistance(
          userLocation.value.latitude,
          userLocation.value.longitude,
          cat.latitude,
          cat.longitude
        )
      }))
      nearbyCats.value = catList.value.map(cat => ({
        ...cat,
        distance: calcDistance(
          userLocation.value.latitude,
          userLocation.value.longitude,
          cat.latitude,
          cat.longitude
        )
      }))
      console.log('[catStore] initMockData: recalculated', catList.value.length, 'cats')
      return
    }
    catList.value = mockCatList
    nearbyCats.value = mockCatList.map(cat => ({
      ...cat,
      distance: calcDistance(
        userLocation.value.latitude,
        userLocation.value.longitude,
        cat.latitude,
        cat.longitude
      )
    }))
    console.log('[catStore] initMockData: loaded', mockCatList.length, 'mock cats')
  }

  function setUserLocation(loc) {
    console.log('[catStore] setUserLocation:', loc)
    userLocation.value = loc
    catList.value = catList.value.map(cat => {
      const dist = calcDistance(loc.latitude, loc.longitude, cat.latitude, cat.longitude)
      return {
        ...cat,
        distance: dist
      }
    })
    nearbyCats.value = catList.value.map(cat => ({
      ...cat,
      distance: calcDistance(loc.latitude, loc.longitude, cat.latitude, cat.longitude)
    }))
    console.log('[catStore] distances recalculated for', catList.value.length, 'cats')
  }

  const filteredCats = computed(() => {
    let list = catList.value.map(cat => {
      const dist = calcDistance(
        userLocation.value.latitude,
        userLocation.value.longitude,
        cat.latitude,
        cat.longitude
      )
      return { ...cat, distance: dist }
    })

    list = list.filter(cat => cat.distance <= range.value)

    if (activeFilter.value !== 'all') {
      const filterMap = {
        'need-feed': 'need_feed',
        'need-rescue': 'need_rescue',
        'new-found': 'new_found',
        'recent-update': 'recent_update'
      }
      const key = filterMap[activeFilter.value]
      if (key) list = list.filter(c => c.tags.includes(key))
    }

    if (searchKeyword.value) {
      const kw = searchKeyword.value.trim().toLowerCase()
      list = list.filter(c => c.name.toLowerCase() === kw)
    }

    return list.sort((a, b) => (a.distance || 0) - (b.distance || 0))
  })

  function setFilter(filter) {
    activeFilter.value = filter
  }

  function setSearchKeyword(kw) {
    searchKeyword.value = kw
  }

  function setCurrentCat(cat) {
    currentCat.value = cat
  }

  function getCatById(id) {
    return catList.value.find(c => c.id === id)
  }

  function addCat(catData) {
    console.log('addCat 接收的数据:', JSON.stringify(catData))
    console.log('[catStore] addCat input:', {
      latitude: catData.latitude,
      longitude: catData.longitude,
      name: catData.name
    })
    
    if (!catData.latitude || !catData.longitude) {
      console.warn('[catStore] addCat: missing coordinates!')
    }
    
    const distance = calcDistance(
      userLocation.value.latitude,
      userLocation.value.longitude,
      catData.latitude,
      catData.longitude
    )
    
    console.log('[catStore] addCat calculated distance:', distance, 'km')
    console.log('[catStore] userLocation:', userLocation.value)
    
    const now = new Date()
    const nowISO = now.toISOString()
    const nowFormatted = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0')

    // 自动生成状态时间线首条：建档记录
    const createdTimeline = {
      id: 'tl_' + Date.now(),
      type: 'created',
      content: '建档创建 - ' + (catData.statusText || '新发现'),
      time: nowFormatted,
      user: '当前用户',
      photos: [],
      location: catData.location || ''
    }

    const newCat = {
      id: 'cat_' + Date.now(),
      ...catData,
      distance: distance,
      status: catData.healthStatus || catData.status || 'healthy',
      statusText: catData.statusText || '新发现',
      tags: catData.tags || ['new_found'],
      createBy: 'user_001',
      createTime: nowISO,
      updateTime: nowISO,
      lastUpdate: formatRelativeTime(nowISO),
      feedingRecords: catData.feedingRecords || [],
      statusTimeline: catData.statusTimeline && catData.statusTimeline.length
        ? catData.statusTimeline
        : [createdTimeline]
    }
    
    console.log('[catStore] newCat created:', {
      id: newCat.id,
      lat: newCat.latitude,
      lng: newCat.longitude,
      distance: newCat.distance
    })
    
    catList.value.unshift(newCat)
    nearbyCats.value.unshift(newCat)
    
    console.log('[catStore] catList length:', catList.value.length)
    return newCat
  }

  function updateCat(catId, data) {
    const idx = catList.value.findIndex(c => c.id === catId)
    if (idx === -1) return null
    const existing = catList.value[idx]
    const now = new Date()
    const merged = {
      ...existing,
      ...data,
      id: catId,
      updateTime: now.toISOString(),
      lastUpdate: formatRelativeTime(now.toISOString())
    }
    catList.value.splice(idx, 1, merged)

    const nearbyIdx = nearbyCats.value.findIndex(c => c.id === catId)
    if (nearbyIdx !== -1) {
      nearbyCats.value.splice(nearbyIdx, 1, merged)
    }
    return merged
  }

  function addFeedingRecord(catId, record) {
    const idx = catList.value.findIndex(c => c.id === catId)
    if (idx === -1) {
      console.warn('[catStore] addFeedingRecord: cat not found:', catId)
      return null
    }

    const cat = catList.value[idx]
    const now = new Date()
    const nowISO = now.toISOString()
    const nowFormatted = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0')

    // 构建 feedingRecord（字段完整性校验 + 默认值兜底）
    const feedingRecord = {
      id: 'feed_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      user: record.user || '当前用户',
      avatar: record.avatar || '',
      foodType: record.foodType || '未知',
      foodColor: record.foodColor || 'primary',
      foodWeight: record.foodWeight || '',
      content: record.content || '',
      time: record.time || nowFormatted,
      photos: Array.isArray(record.photos) ? record.photos : [],
      location: record.location || '',
      latitude: record.latitude || 0,
      longitude: record.longitude || 0,
      catStatus: record.catStatus || '',
      createTime: nowISO
    }

    // 构建 statusTimeline 条目（同步写入状态变更栏目）
    const timelineItem = {
      id: 'tl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      type: 'feeding',
      content: (() => {
        const statusTextMap = { healthy: '健康', attention: '需关注', urgent: '紧急' }
        const statusText = feedingRecord.catStatus ? statusTextMap[feedingRecord.catStatus] || '' : ''
        const parts = ['投喂 ' + feedingRecord.foodType]
        if (statusText) parts.push('状态: ' + statusText)
        if (feedingRecord.content) parts.push(feedingRecord.content)
        return parts.join(' - ')
      })(),
      time: feedingRecord.time,
      user: feedingRecord.user,
      photos: feedingRecord.photos,
      location: feedingRecord.location
    }

    // 不可变更新：创建新对象替换旧对象，确保 Pinia 响应式追踪
    // 如果投喂记录携带了有效位置，同步更新猫咪的出没地点
    const hasValidLocation = feedingRecord.location ||
      (feedingRecord.latitude && feedingRecord.longitude)
    // 状态映射：catStatus → status + statusText
    const statusMap = {
      healthy: { status: 'healthy', statusText: '健康' },
      attention: { status: 'attention', statusText: '需关注' },
      urgent: { status: 'urgent', statusText: '紧急' }
    }
    const statusUpdate = feedingRecord.catStatus && statusMap[feedingRecord.catStatus]
      ? statusMap[feedingRecord.catStatus]
      : { status: cat.status, statusText: cat.statusText }

    const updatedCat = {
      ...cat,
      feedingRecords: [feedingRecord, ...(cat.feedingRecords || [])],
      statusTimeline: [timelineItem, ...(cat.statusTimeline || [])],
      location: hasValidLocation ? feedingRecord.location : cat.location,
      latitude: hasValidLocation && feedingRecord.latitude ? feedingRecord.latitude : cat.latitude,
      longitude: hasValidLocation && feedingRecord.longitude ? feedingRecord.longitude : cat.longitude,
      status: statusUpdate.status,
      statusText: statusUpdate.statusText,
      updateTime: nowISO,
      lastUpdate: formatRelativeTime(nowISO)
    }

    catList.value.splice(idx, 1, updatedCat)

    // 同步更新 nearbyCats
    const nearbyIdx = nearbyCats.value.findIndex(c => c.id === catId)
    if (nearbyIdx !== -1) {
      nearbyCats.value.splice(nearbyIdx, 1, updatedCat)
    }

    console.log('[catStore] addFeedingRecord success:', {
      catId: catId,
      feedingRecordId: feedingRecord.id,
      timelineItemId: timelineItem.id
    })
    return updatedCat
  }

  // 通用方法：向指定猫咪的 statusTimeline 添加条目
  function addStatusTimeline(catId, item) {
    const idx = catList.value.findIndex(c => c.id === catId)
    if (idx === -1) {
      console.warn('[catStore] addStatusTimeline: cat not found:', catId)
      return null
    }

    const cat = catList.value[idx]
    const now = new Date()
    const nowISO = now.toISOString()
    const nowFormatted = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0')

    const timelineItem = {
      id: 'tl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      type: item.type || 'status_change',
      content: item.content || '',
      time: item.time || nowFormatted,
      user: item.user || '当前用户',
      photos: Array.isArray(item.photos) ? item.photos : [],
      location: item.location || ''
    }

    const updatedCat = {
      ...cat,
      statusTimeline: [timelineItem, ...(cat.statusTimeline || [])],
      updateTime: nowISO,
      lastUpdate: formatRelativeTime(nowISO)
    }

    catList.value.splice(idx, 1, updatedCat)

    const nearbyIdx = nearbyCats.value.findIndex(c => c.id === catId)
    if (nearbyIdx !== -1) {
      nearbyCats.value.splice(nearbyIdx, 1, updatedCat)
    }

    return updatedCat
  }

  return {
    catList,
    currentCat,
    nearbyCats,
    activeFilter,
    searchKeyword,
    range,
    userLocation,
    filteredCats,
    initMockData,
    setUserLocation,
    setFilter,
    setSearchKeyword,
    setCurrentCat,
    getCatById,
    addCat,
    updateCat,
    addFeedingRecord,
    addStatusTimeline,

    // 检查猫咪名称是否已存在（编辑时排除自身 ID）
    checkNameExist(name, excludeId) {
      if (!name) return false
      const trimmedName = name.trim()
      return catList.value.some(c =>
        c.name === trimmedName && c.id !== excludeId
      )
    }
  }
})