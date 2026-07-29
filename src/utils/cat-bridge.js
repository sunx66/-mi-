// Ultra-simple cross-page data bridge
// Uses module-level variable - survives uni-app lifecycle quirks

let _currentCat = null

export function setCurrentCat(cat) {
  _currentCat = cat ? JSON.parse(JSON.stringify(cat)) : null
  return _currentCat
}

export function getCurrentCat() {
  return _currentCat
}

export function clearCurrentCat() {
  _currentCat = null
}
