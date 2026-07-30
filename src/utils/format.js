/**
 * 格式化时间为相对时间
 */
export function formatRelativeTime(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}个月前`
}

/**
 * 格式化日期
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 获取状态颜色
 */
export function getStatusColor(status) {
  const map = {
    healthy: { color: '#22a860', bg: '#e6f7ee', text: '健康' },
    attention: { color: '#e68a00', bg: '#fff3db', text: '需关注' },
    urgent: { color: '#dc2626', bg: '#fde8e8', text: '需救助' },
    minor: { color: '#e68a00', bg: '#fff3db', text: '轻微伤病' },
    severe: { color: '#dc2626', bg: '#fde8e8', text: '重伤病' }
  }
  return map[status] || map.healthy
}

/**
 * 获取性别文字
 */
export function getGenderText(gender) {
  const map = { male: '公 ♂', female: '母 ♀', unknown: '未知' }
  return map[gender] || '未知'
}

/**
 * 获取食物类型颜色
 */
export function getFoodColor(type) {
  const map = {
    '猫粮': 'primary',
    '罐头': 'warning',
    '清水': 'info',
    '零食': 'primary',
    '自制猫饭': 'success',
    '其他': 'default'
  }
  return map[type] || 'default'
}
