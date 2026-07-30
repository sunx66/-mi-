/**
 * 腾讯地图 WebService API 基础路径
 * 开发环境使用 Vite 代理，生产环境直接调用
 */
export const TENCENT_MAP_API_BASE = (import.meta.env && import.meta.env.DEV)
  ? '/api/tencent'
  : 'https://apis.map.qq.com/ws'
