/**
 * 外部地图导航工具
 * 通过 URL Scheme 唤起手机原生地图 App（腾讯/高德/百度）
 *
 * Safari 兼容关键点：
 * 1. 入口函数必须是同步调用（由用户手势直接触发）
 * 2. ActionSheet 的 success 回调内的跳转，Safari 视为用户手势延续，允许同步触发
 * 3. 不能放在 Promise.then / setTimeout / 异步请求回调内部
 */

/**
 * 检测当前环境是否为 iOS
 */
function isIOS() {
  // #ifdef H5
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document)
  // #endif
  // #ifndef H5
  return false
  // #endif
}

/**
 * 构建各地图 App 的 Scheme（兼容 iOS / 安卓）
 * @param {string} provider - 地图提供商：amap | baidu | tencent
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @param {string} name - 目标名称
 * @returns {string} scheme URL
 */
function buildScheme(provider, latitude, longitude, name) {
  const encodedName = encodeURIComponent(name || '目标位置')
  const ios = isIOS()

  switch (provider) {
    case 'amap':
      // 高德地图：iOS 使用 iosamap://，安卓使用 amapuri://
      if (ios) {
        return `iosamap://navi?sourceApplication=nuan-miao-help&backScheme=nuanmiao&lat=${latitude}&lon=${longitude}&name=${encodedName}&dev=0&style=2`
      }
      return `androidamap://navi?sourceApplication=nuan-miao-help&lat=${latitude}&lon=${longitude}&name=${encodedName}&dev=0&style=2`

    case 'baidu':
      // 百度地图：iOS 和安卓 Scheme 一致
      return `baidumap://map/direction?destination=latlng:${latitude},${longitude}|name:${encodedName}&mode=walking&coord_type=gcj02&src=webapp.nuan-miao-help`

    case 'tencent':
      // 腾讯地图：使用 Universal Link（iOS 友好）+ 网页兜底
      return `https://apis.map.qq.com/uri/v1/routeplan?type=walk&to=${encodedName}&tocoord=${latitude},${longitude}&referer=nuan-miao-help`

    default:
      return ''
  }
}

/**
 * 同步唤起 App（Safari 兼容）
 * 使用 location.href 跳转 Scheme，Safari 在用户手势延续上下文中允许此操作
 * @param {string} scheme - scheme URL
 * @returns {boolean} 是否触发了跳转
 */
function launchAppSync(scheme) {
  // #ifdef H5
  try {
    // Safari/Chrome 允许在用户手势同步上下文中修改 location.href
    window.location.href = scheme
    return true
  } catch (e) {
    console.warn('[mapNav] launchAppSync error:', e.message)
    return false
  }
  // #endif
  // #ifndef H5
  return false
  // #endif
}

/**
 * 兜底：打开腾讯地图网页版（App 未安装时）
 * 使用 window.open 在新标签页打开，避免影响当前页面
 */
function openWebMapFallback(latitude, longitude, name) {
  // #ifdef H5
  const qqUrl = `https://apis.map.qq.com/uri/v1/routeplan?type=walk&to=${encodeURIComponent(name || '目标位置')}&tocoord=${latitude},${longitude}&referer=nuan-miao-help`
  // 尝试新窗口打开
  const newWin = window.open(qqUrl, '_blank')
  // 如果被弹窗拦截，回退到当前页面跳转
  if (!newWin) {
    window.location.href = qqUrl
  }
  // #endif
}

/**
 * 打开外部导航（主入口，同步函数）
 * 交互流程：点击导航按钮 → 弹出选择框（腾讯/高德/百度）→ 选中后跳转对应地图
 *
 * @param {number} latitude - 目标纬度
 * @param {number} longitude - 目标经度
 * @param {string} name - 目标名称
 */
export function openExternalNavigation(latitude, longitude, name = '目标位置') {
  if (!latitude || !longitude) {
    uni.showToast({ title: '位置信息缺失', icon: 'none' })
    return
  }

  // #ifdef MP-WEIXIN
  // 小程序端：直接使用 uni.openLocation 打开内置地图
  uni.openLocation({
    latitude: latitude,
    longitude: longitude,
    name: name,
    scale: 18,
    fail: () => {
      uni.showToast({ title: '打开地图失败', icon: 'none' })
    }
  })
  return
  // #endif

  // #ifdef H5
  // H5 端：弹出地图选择框（ActionSheet 的 success 回调被视为用户手势延续）
  uni.showActionSheet({
    itemList: ['高德地图', '百度地图', '腾讯地图'],
    success: (res) => {
      let provider = ''
      switch (res.tapIndex) {
        case 0: provider = 'amap'; break
        case 1: provider = 'baidu'; break
        case 2: provider = 'tencent'; break
      }

      if (!provider) return

      const scheme = buildScheme(provider, latitude, longitude, name)

      // 腾讯地图直接走 Universal Link / 网页版（无 Scheme）
      if (provider === 'tencent') {
        openWebMapFallback(latitude, longitude, name)
        return
      }

      // 高德/百度：同步触发 Scheme（Safari 兼容关键点）
      const launched = launchAppSync(scheme)

      // 兜底：如果同步触发失败，或 2.5 秒后仍在当前页面，说明 App 未安装，打开网页版
      if (launched) {
        const start = Date.now()
        setTimeout(() => {
          // 如果超过 2.5 秒页面还可见，说明 App 没有被唤起
          if (Date.now() - start >= 2400 && !document.hidden) {
            console.warn('[mapNav] App not launched, falling back to web map')
            openWebMapFallback(latitude, longitude, name)
          }
        }, 2500)
      } else {
        // 同步触发立即失败，直接走网页版兜底
        openWebMapFallback(latitude, longitude, name)
      }
    },
    fail: () => {
      // 用户取消选择，不做任何操作
    }
  })
  // #endif
}
