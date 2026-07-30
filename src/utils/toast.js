/**
 * Toast 工具函数
 */

export function showSuccess(title) {
  uni.showToast({
    title: title || '操作成功',
    icon: 'success'
  })
}

export function showError(title) {
  uni.showToast({
    title: title || '操作失败',
    icon: 'none'
  })
}

export function showLoading(title) {
  uni.showLoading({
    title: title || '加载中...',
    mask: true
  })
}

export function hideLoading() {
  uni.hideLoading()
}
