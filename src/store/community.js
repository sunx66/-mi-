import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockPostList } from '../mock/community'

// 当前用户标识（mock）
const CURRENT_USER = {
  id: 'user_001',
  name: '暖喵志愿者',
  avatar: '',
  avatarColor: '#ff8210'
}

// mock 评论数据
const mockCommentsMap = {
  post_001: [
    { id: 'c_001', postId: 'post_001', author: '王叔', authorColor: '#3b82f6', content: '我就在附近，马上过来看看', createTime: '2026-07-29T09:00:00' },
    { id: 'c_002', postId: 'post_001', author: '小李同学', authorColor: '#ff9c35', content: '可以帮忙联系捕猫笼，需要的话私信我', createTime: '2026-07-29T09:30:00' }
  ],
  post_002: [
    { id: 'c_003', postId: 'post_002', author: '陈阿姨', authorColor: '#22a860', content: '正好家里缺猫粮，感谢分享', createTime: '2026-07-29T06:00:00' }
  ],
  post_003: [
    { id: 'c_004', postId: 'post_003', author: '张大姐', authorColor: '#ff8210', content: '大黑越来越亲人了，真好', createTime: '2026-07-28T15:00:00' },
    { id: 'c_005', postId: 'post_003', author: '暖喵帮扶小组', authorColor: '#8b5cf6', content: '辛苦了，记录得很详细', createTime: '2026-07-28T16:00:00' }
  ]
}

export const useCommunityStore = defineStore('community', () => {
  const postList = ref([])
  const activeTab = ref('all')
  const loading = ref(false)
  const error = ref('')

  // 点赞状态：存储当前用户点赞过的帖子 ID
  const likedPosts = ref(new Set())

  // 评论数据
  const commentsMap = ref({})
  const commentsLoading = ref(false)
  const commentsError = ref('')

  // 发帖状态
  const submitting = ref(false)

  function initMockData() {
    postList.value = mockPostList
    // 初始化 mock 点赞状态（已点赞 post_003、post_005）
    likedPosts.value = new Set(['post_003', 'post_005'])
  }

  /**
   * 模拟异步加载公告列表
   */
  function fetchAnnouncements(options = {}) {
    loading.value = true
    error.value = ''
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          if (options.fail) {
            throw new Error('模拟接口请求失败')
          }
          postList.value = mockPostList
          // 初始化 mock 点赞状态
          likedPosts.value = new Set(['post_003', 'post_005'])
          loading.value = false
          resolve(postList.value)
        } catch (e) {
          postList.value = []
          loading.value = false
          error.value = e.message || '加载失败，请重试'
          resolve([])
        }
      }, 1200)
    })
  }

  function setTab(tab) {
    activeTab.value = tab
  }

  /**
   * 获取已过滤的帖子列表
   * - 只展示 status === 'published'
   * - 按 publishTime 倒序
   * - 按 activeTab 过滤类型
   */
  function getFilteredPosts() {
    let list = postList.value.filter(p => p.status === 'published')

    if (activeTab.value !== 'all') {
      const tabMap = {
        'rescue': 'rescue',
        'supply': 'supply',
        'status': 'status',
        'adopt': 'adopt'
      }
      const key = tabMap[activeTab.value]
      if (key) {
        list = list.filter(p => p.type === key)
      }
    }

    return list.slice().sort((a, b) => {
      const ta = new Date(a.publishTime || 0).getTime()
      const tb = new Date(b.publishTime || 0).getTime()
      return tb - ta
    })
  }

  /**
   * 判断当前用户是否已点赞
   */
  function isLiked(postId) {
    return likedPosts.value.has(postId)
  }

  /**
   * 切换点赞状态
   * @returns {boolean} 切换后的状态（true=已点赞）
   */
  function toggleLike(postId) {
    const post = postList.value.find(p => p.id === postId)
    if (!post) return false

    if (likedPosts.value.has(postId)) {
      // 取消点赞
      likedPosts.value.delete(postId)
      post.likes = Math.max(0, post.likes - 1)
      return false
    } else {
      // 点赞
      likedPosts.value.add(postId)
      post.likes = (post.likes || 0) + 1
      return true
    }
  }

  /**
   * 加载帖子评论
   */
  function fetchComments(postId) {
    commentsLoading.value = true
    commentsError.value = ''
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const list = mockCommentsMap[postId] || []
          commentsMap.value = { ...commentsMap.value, [postId]: list }
          commentsLoading.value = false
          resolve(list)
        } catch (e) {
          commentsLoading.value = false
          commentsError.value = '加载评论失败'
          resolve([])
        }
      }, 600)
    })
  }

  /**
   * 获取帖子的评论列表
   */
  function getComments(postId) {
    return commentsMap.value[postId] || []
  }

  /**
   * 发送评论
   */
  function addComment(postId, content) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newComment = {
          id: 'c_' + Date.now(),
          postId: postId,
          author: CURRENT_USER.name,
          authorColor: CURRENT_USER.avatarColor,
          content: content,
          createTime: new Date().toISOString()
        }
        const list = commentsMap.value[postId] || []
        commentsMap.value = { ...commentsMap.value, [postId]: [...list, newComment] }

        // 更新帖子评论数
        const post = postList.value.find(p => p.id === postId)
        if (post) post.comments = (post.comments || 0) + 1

        resolve(newComment)
      }, 400)
    })
  }

  /**
   * 提交新帖子
   */
  function submitPost(postData) {
    submitting.value = true
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const typeMap = {
            rescue: { typeName: '救助求助', typeColor: '#dc2626' },
            supply: { typeName: '物资互助', typeColor: '#ff8210' },
            status: { typeName: '状态播报', typeColor: '#3b82f6' },
            adopt: { typeName: '领养预告', typeColor: '#22a860' }
          }
          const typeInfo = typeMap[postData.type] || {}

          const newPost = {
            id: 'post_' + Date.now(),
            type: postData.type,
            typeName: typeInfo.typeName || '',
            typeColor: typeInfo.typeColor || '#999',
            title: postData.title,
            content: postData.content,
            contentFull: postData.content,
            author: CURRENT_USER.name,
            authorAvatar: '',
            authorColor: CURRENT_USER.avatarColor,
            location: postData.location || '未填写',
            photos: postData.photos || [],
            likes: 0,
            comments: 0,
            publishTime: new Date().toISOString(),
            time: '刚刚',
            isUrgent: postData.type === 'rescue',
            status: 'published'
          }

          postList.value.unshift(newPost)
          submitting.value = false
          resolve(newPost)
        } catch (e) {
          submitting.value = false
          reject(e)
        }
      }, 800)
    })
  }

  function addPost(postData) {
    postList.value.unshift({
      id: 'post_' + Date.now(),
      ...postData,
      likes: 0,
      comments: 0,
      createTime: new Date().toISOString()
    })
  }

  function likePost(postId) {
    const post = postList.value.find(p => p.id === postId)
    if (post) post.likes++
  }

  return {
    postList,
    activeTab,
    loading,
    error,
    likedPosts,
    commentsMap,
    commentsLoading,
    commentsError,
    submitting,
    initMockData,
    fetchAnnouncements,
    setTab,
    getFilteredPosts,
    isLiked,
    toggleLike,
    fetchComments,
    getComments,
    addComment,
    submitPost,
    addPost,
    likePost
  }
})
