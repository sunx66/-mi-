import { getCartoonAvatar } from './cartoonCat'

const STATUS_COLORS = {
  healthy: { main: '#22a860', light: '#e6f7ee' },
  attention: { main: '#e68a00', light: '#fff3db' },
  urgent: { main: '#dc2626', light: '#fde8e8' },
  minor: { main: '#e68a00', light: '#fff3db' },
  severe: { main: '#dc2626', light: '#fde8e8' }
}

function buildPhotoMarker(status, photoUrl) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.healthy
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="90" viewBox="0 0 72 90">
  <defs>
    <clipPath id="catClip"><circle cx="36" cy="30" r="22"/></clipPath>
  </defs>
  <path d="M36 86 C36 86 8 48 8 30 A28 28 0 1 1 64 30 C64 48 36 86 36 86 Z" fill="${color.main}" stroke="#ffffff" stroke-width="3"/>
  <circle cx="36" cy="30" r="24" fill="#ffffff"/>
  <g clip-path="url(#catClip)">
    <image href="${photoUrl}" x="8" y="2" width="56" height="56" preserveAspectRatio="xMidYMid slice"/>
  </g>
  <circle cx="36" cy="30" r="22" fill="none" stroke="${color.main}" stroke-width="3"/>
  <circle cx="56" cy="14" r="10" fill="${color.main}" stroke="#ffffff" stroke-width="3"/>
</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

function buildEmojiMarker(status) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.healthy
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="90" viewBox="0 0 72 90">
  <path d="M36 86 C36 86 8 48 8 30 A28 28 0 1 1 64 30 C64 48 36 86 36 86 Z" fill="${color.main}" stroke="#ffffff" stroke-width="3"/>
  <circle cx="36" cy="30" r="20" fill="#ffffff"/>
  <text x="36" y="38" font-size="26" text-anchor="middle" dominant-baseline="middle">🐱</text>
  <circle cx="56" cy="14" r="10" fill="${color.main}" stroke="#ffffff" stroke-width="3"/>
</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

function buildUserMarker() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="#1976D2" opacity="0.3"/>
    <circle cx="16" cy="16" r="8" fill="#1976D2" stroke="#ffffff" stroke-width="2"/>
    <circle cx="16" cy="16" r="4" fill="#ffffff"/>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

function buildStaticPath(status) {
  const map = {
    healthy: '/static/markers/marker-healthy.svg',
    attention: '/static/markers/marker-attention.svg',
    urgent: '/static/markers/marker-urgent.svg',
    minor: '/static/markers/marker-attention.svg',
    severe: '/static/markers/marker-urgent.svg'
  }
  return map[status] || map.healthy
}

export function getMarkerIcon(status, photoUrl, cat) {
  if (status === 'user-location') {
    return buildUserMarker()
  }
  // #ifdef H5
  if (photoUrl) {
    try {
      return buildPhotoMarker(status, photoUrl)
    } catch (e) {}
  }
  if (cat) {
    try {
      const cartoon = getCartoonAvatar(cat)
      return buildPhotoMarker(status, cartoon.avatar)
    } catch (e) {}
  }
  return buildEmojiMarker(status)
  // #endif
  // #ifndef H5
  return buildStaticPath(status)
  // #endif
}

export { STATUS_COLORS }