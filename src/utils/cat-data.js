// Most reliable cross-page cat data passer
// Uses uni.setStorageSync/uni.getStorageSync - synchronous, persistent

const KEY = 'cat_profile_data'

export function saveCat(cat) {
  try {
    uni.setStorageSync(KEY, JSON.stringify(cat))
    return true
  } catch (e) {
    console.error('[cat-data] save failed:', e)
    return false
  }
}

export function loadCat() {
  try {
    const raw = uni.getStorageSync(KEY)
    if (raw) {
      const cat = JSON.parse(raw)
      uni.removeStorageSync(KEY)
      return cat
    }
  } catch (e) {
    console.error('[cat-data] load failed:', e)
  }
  return null
}

export function clearCat() {
  try {
    uni.removeStorageSync(KEY)
  } catch (e) {}
}
