/**
 * 腾讯地图 Keys（从 config 导入，避免硬编码）
 */
import { QQ_MAP_GL_KEY, QQ_MAP_LOCATION_KEY } from '@/config/keys'
import { TENCENT_MAP_API_BASE } from '@/utils/apiBase'

/**
 * 默认位置（杭州市中心）
 */
const DEFAULT_LOCATION = {
  latitude: 38.2994,
  longitude: 116.9816,
  accuracy: 0
}

/**
 * 通过腾讯地图 GL JS Service 进行定位
 */
function getLocationByTMap() {
  return new Promise((resolve, reject) => {
    if (typeof window.TMap === 'undefined' || !window.TMap.service) {
      reject(new Error('TMap 不可用'))
      return
    }
    // TMap.service.Geolocation 需要单独加载 libraries=service
    // 如果不可用则跳过
    if (!window.TMap.service.Geolocation) {
      reject(new Error('TMap Geolocation 未加载'))
      return
    }
    try {
      const geolocation = new window.TMap.service.Geolocation()
      geolocation.getPosition({
        success: (result) => {
          if (result && result.lat && result.lng) {
            resolve({
              latitude: result.lat,
              longitude: result.lng,
              accuracy: result.accuracy || 100
            })
          } else {
            reject(new Error('TMap定位返回异常'))
          }
        },
        fail: (err) => {
          reject(new Error('TMap定位失败: ' + (err?.message || JSON.stringify(err))))
        }
      })
    } catch (e) {
      reject(new Error('TMap定位异常: ' + e.message))
    }
  })
}

/**
 * 通过腾讯地图 WebService API 进行 IP 定位
 */
function getLocationByIP(key) {
  return new Promise((resolve, reject) => {
    const callbackName = 'qqLocationCallback_' + Date.now()
    const script = document.createElement('script')
    let cleaned = false

    function cleanup() {
      if (cleaned) return
      cleaned = true
      delete window[callbackName]
      if (script.parentNode) script.parentNode.removeChild(script)
    }

    window[callbackName] = function(data) {
      if (data && data.status === 0 && data.result && data.result.location) {
        cleanup()
        resolve({
          latitude: data.result.location.lat,
          longitude: data.result.location.lng,
          accuracy: 0
        })
      } else {
        cleanup()
        reject(new Error('IP定位失败: ' + (data?.message || '未知错误')))
      }
    }

    script.onerror = () => {
      if (cleaned) return
      cleanup()
      reject(new Error('加载腾讯地图定位服务失败'))
    }

    script.src = TENCENT_MAP_API_BASE + '/location/v1/ip?output=jsonp&key=' + key + '&callback=' + callbackName
    document.head.appendChild(script)
    setTimeout(() => {
      cleanup()
      reject(new Error('IP定位超时'))
    }, 5000)
  })
}

/**
 * 获取当前位置（兼容微信小程序和H5）
 */
export function getLocation() {
  return new Promise((resolve) => {
    // #ifdef H5
    // 方案1: 尝试腾讯地图 qq.maps.Geolocation（如果可用，最适合国内定位）
    if (typeof window.qq !== 'undefined' && window.qq.maps && window.qq.maps.Geolocation) {
      try {
        const geo = new window.qq.maps.Geolocation(QQ_MAP_LOCATION_KEY, 'nuan_miao_app')
        geo.getPosition(
          (result) => {
            if (result && result.latLng) {
              resolve({
                latitude: result.latLng.lat,
                longitude: result.latLng.lng,
                accuracy: result.accuracy || 50
              })
            } else {
              // 返回异常时继续 fallback，避免 Promise 永久挂起
              console.warn('[location] qq.maps定位返回异常，回退到浏览器/IP定位')
              tryBrowserAndIP()
            }
          },
          () => {
            // 失败则尝试浏览器原生
            tryBrowserAndIP()
          },
          { timeout: 8000 }
        )
        return
      } catch (e) {
        // 继续尝试其他方式
      }
    }
    // 方案2: 尝试浏览器原生定位 + IP 定位
    tryBrowserAndIP()
    
    function tryBrowserAndIP() {
      // 优先尝试腾讯 IP 定位（不需要浏览器权限，在国内精度足够）
      getLocationByIP(QQ_MAP_LOCATION_KEY)
        .then(loc => {
          console.log('[location] IP定位成功:', loc)
          resolve(loc)
        })
        .catch(() => {
          // 尝试用 GL Key 进行 IP 定位
          getLocationByIP(QQ_MAP_GL_KEY)
            .then(loc => {
              console.log('[location] IP定位(GL Key)成功:', loc)
              resolve(loc)
            })
            .catch(() => {
              // IP定位全部失败，尝试浏览器原生定位
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    resolve({
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude,
                      accuracy: pos.coords.accuracy || 50
                    })
                  },
                  (err) => {
                    console.warn('浏览器定位也失败，使用默认位置:', err.message)
                    resolve({ ...DEFAULT_LOCATION })
                  },
                  { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
                )
              } else {
                resolve({ ...DEFAULT_LOCATION })
              }
            })
        })
    }
    // #endif

    // #ifdef MP-WEIXIN
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude,
          accuracy: res.accuracy
        })
      },
      fail: () => {
        resolve({ ...DEFAULT_LOCATION })
      }
    })
    // #endif
  })
}

/**
 * 选择位置（微信小程序使用 chooseLocation）
 */
export function chooseLocation() {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.chooseLocation({
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    })
    // #endif
    // #ifdef H5
    reject(new Error('H5端暂不支持选择位置'))
    // #endif
  })
}

/**
 * 计算两点间距离（km）
 */
export function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const aClamped = Math.min(1, Math.max(0, a))
  const c = 2 * Math.atan2(Math.sqrt(aClamped), Math.sqrt(1 - aClamped))
  return Math.abs(Math.round(R * c * 10) / 10)
}

/**
 * 格式化距离
 */
export function formatDistance(km) {
  if (km < 1) return Math.round(km * 1000) + 'm'
  return km + 'km'
}
