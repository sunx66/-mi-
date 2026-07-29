// Simple cross-page data passer
// Avoids Pinia reactivity issues during page navigation

const PASS_KEY = 'cat_profile_pass_data'

export function passCatData(cat) {
  try {
    const data = JSON.stringify(cat)
    uni.setStorageSync(PASS_KEY, data)
    console.log('[cat-pass] Saved cat data:', cat?.name, cat?.id)
  } catch (e) {
    console.error('[cat-pass] Failed to save:', e)
  }
}

export function getPassedCatData() {
  try {
    const data = uni.getStorageSync(PASS_KEY)
    if (data) {
      const cat = JSON.parse(data)
      console.log('[cat-pass] Retrieved cat data:', cat?.name, cat?.id)
      uni.removeStorageSync(PASS_KEY)
      return cat
    }
  } catch (e) {
    console.error('[cat-pass] Failed to retrieve:', e)
  }
  return null
}

export function clearPassedCatData() {
  try {
    uni.removeStorageSync(PASS_KEY)
  } catch (e) {}
}
