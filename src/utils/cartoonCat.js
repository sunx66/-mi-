// 猫咪卡通头像生成器
// 根据猫咪的名字或身体描述生成颜色和卡通 SVG

// 颜色规则：根据名字/特征识别主色调
const COLOR_RULES = [
  { keywords: ['橘', '橙', '黄', '花'], primary: '#FFA726', secondary: '#FFF3E0' }, // 橘猫
  { keywords: ['黑', '煤', '碳', '乌'], primary: '#424242', secondary: '#757575' }, // 黑猫
  { keywords: ['白', '雪', '奶', '银'], primary: '#F5F5F5', secondary: '#E0E0E0' }, // 白猫
  { keywords: ['三花', '三毛', '杂'], primary: '#FF9800', secondary: '#FFF8E1' }, // 三花
  { keywords: ['狸', '棕', '虎', '斑'], primary: '#8D6E63', secondary: '#D7CCC8' }, // 狸花/棕虎斑
  { keywords: ['灰', '蓝', '英'], primary: '#78909C', secondary: '#CFD8DC' }, // 蓝猫/灰猫
  { keywords: ['奶牛', '黑白', '熊猫'], primary: '#212121', secondary: '#FFFFFF' }, // 奶牛
  { keywords: ['玳瑁', '龟'], primary: '#BF360C', secondary: '#FFCCBC' }, // 玳瑁
  { keywords: ['红', '姜'], primary: '#E57373', secondary: '#FFCDD2' }, // 红色
  { keywords: ['粉'], primary: '#F8BBD0', secondary: '#FCE4EC' } // 粉色
]

// 默认花色
const DEFAULT_COLOR = { primary: '#B0BEC5', secondary: '#ECEFF1' }

// 特殊花纹（根据颜色组合生成）
const PATTERN_RULES = [
  { keywords: ['奶牛', '黑白'], pattern: 'cow' },
  { keywords: ['三花', '杂'], pattern: 'calico' },
  { keywords: ['狸', '虎', '斑'], pattern: 'tabby' },
  { keywords: ['玳瑁', '龟'], pattern: 'tortoiseshell' }
]

/**
 * 根据名字获取猫咪颜色
 * @param {string} name - 猫咪名字
 * @param {string} colorDesc - 猫咪颜色描述
 */
export function getCatColorByName(name, colorDesc = '') {
  const text = (name + colorDesc).toLowerCase()

  let bestMatch = null
  let bestLength = 0

  for (const rule of COLOR_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw) && kw.length > bestLength) {
        bestMatch = rule
        bestLength = kw.length
      }
    }
  }

  // Special name-based overrides
  if (name === '花花' || name === '花花花') {
    return { primary: '#FFE082', secondary: '#FFFFFF', isDefault: false, variant: 'light-calico' }
  }
  if (name === '三花' && (colorDesc === '三花' || colorDesc.includes('三花'))) {
    return { primary: '#212121', secondary: '#FFFFFF', isDefault: false, variant: 'dark-calico' }
  }

  if (bestMatch) {
    return { ...bestMatch, isDefault: false }
  }

  return { ...DEFAULT_COLOR, isDefault: true }
}

/**
 * 检测花纹类型
 */
export function getCatPattern(name, colorDesc = '') {
  const text = (name + colorDesc).toLowerCase()

  let bestPattern = null
  let bestLength = 0

  for (const rule of PATTERN_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw) && kw.length > bestLength) {
        bestPattern = rule.pattern
        bestLength = kw.length
      }
    }
  }

  return bestPattern || 'solid'
}

/**
 * 生成卡通猫咪 SVG
 * @param {string} name - 猫咪名字
 * @param {string} colorDesc - 猫咪颜色描述
 * @returns {string} SVG data URI
 */
export function generateCartoonCatSVG(name, colorDesc = '') {
  const color = getCatColorByName(name, colorDesc)
  const pattern = getCatPattern(name, colorDesc)
  const earColor = color.primary
  const bodyColor = color.variant === 'light-calico' ? '#FFF8E1' : (color.variant === 'dark-calico' ? '#FFFFFF' : color.primary)
  const cheekColor = color.variant === 'light-calico' ? '#D7CCC8' : (color.variant === 'dark-calico' ? '#FFD54F' : color.secondary)

  // 生成花纹
  let patternSVG = ''
  if (pattern === 'tabby') {
    // 虎斑条纹
    patternSVG = `
      <path d="M 25 35 Q 30 40 35 35" stroke="#3E2723" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 45 35 Q 50 40 55 35" stroke="#3E2723" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 20 50 Q 25 55 30 50" stroke="#3E2723" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M 40 50 Q 45 55 50 50" stroke="#3E2723" stroke-width="1.5" fill="none" stroke-linecap="round"/>`
  } else if (pattern === 'cow') {
    // 奶牛斑点
    patternSVG = `
      <ellipse cx="28" cy="45" rx="12" ry="8" fill="#212121" opacity="0.3"/>
      <ellipse cx="50" cy="55" rx="10" ry="7" fill="#212121" opacity="0.3"/>`
  } else if (pattern === 'calico') {
    // 三花
    const variant = color.variant || ''
    if (variant === 'light-calico') {
      // 花花：浅黄色+白色+浅棕色
      patternSVG = `
        <ellipse cx="28" cy="48" rx="10" ry="7" fill="#FFE082" opacity="0.7"/>
        <ellipse cx="50" cy="42" rx="9" ry="6" fill="#FFFFFF" opacity="0.8"/>
        <ellipse cx="42" cy="56" rx="7" ry="5" fill="#D7CCC8" opacity="0.6"/>
        <ellipse cx="20" cy="55" rx="5" ry="4" fill="#FFE082" opacity="0.5"/>`
    } else if (variant === 'dark-calico') {
      // 三花：黑色+白色+黄色
      patternSVG = `
        <ellipse cx="28" cy="48" rx="10" ry="7" fill="#212121" opacity="0.7"/>
        <ellipse cx="50" cy="42" rx="9" ry="6" fill="#FFFFFF" opacity="0.9"/>
        <ellipse cx="42" cy="56" rx="7" ry="5" fill="#FFD54F" opacity="0.8"/>
        <ellipse cx="20" cy="55" rx="5" ry="4" fill="#212121" opacity="0.5"/>`
    } else {
      // 默认三花
      patternSVG = `
        <ellipse cx="25" cy="48" rx="10" ry="7" fill="#FF9800" opacity="0.5"/>
        <ellipse cx="50" cy="42" rx="8" ry="6" fill="#E57373" opacity="0.4"/>
        <ellipse cx="45" cy="58" rx="6" ry="5" fill="#FFFFFF" opacity="0.6"/>`
    }
  } else if (pattern === 'tortoiseshell') {
    // 玳瑁
    patternSVG = `
      <path d="M 25 40 Q 35 45 30 55 Q 25 50 25 40" fill="#5D4037" opacity="0.4"/>
      <path d="M 45 45 Q 50 50 48 58 Q 42 55 45 45" fill="#3E2723" opacity="0.3"/>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <!-- 耳朵 -->
  <path d="M 28 42 L 35 18 L 48 35 Z" fill="${earColor}"/>
  <path d="M 92 42 L 85 18 L 72 35 Z" fill="${earColor}"/>
  <path d="M 32 38 L 37 25 L 45 34 Z" fill="${cheekColor}"/>
  <path d="M 88 38 L 83 25 L 75 34 Z" fill="${cheekColor}"/>

  <!-- 脸 -->
  <circle cx="60" cy="62" r="35" fill="${bodyColor}"/>

  <!-- 花纹 -->
  ${patternSVG}

  <!-- 眼睛 -->
  <ellipse cx="46" cy="58" rx="6" ry="8" fill="#FFFFFF"/>
  <ellipse cx="74" cy="58" rx="6" ry="8" fill="#FFFFFF"/>
  <circle cx="47" cy="60" r="4" fill="#333"/>
  <circle cx="75" cy="60" r="4" fill="#333"/>
  <circle cx="48" cy="58" r="1.5" fill="#FFF"/>
  <circle cx="76" cy="58" r="1.5" fill="#FFF"/>

  <!-- 鼻子 -->
  <path d="M 55 72 Q 60 76 65 72 Q 60 78 55 72" fill="#FF8A80"/>

  <!-- 嘴巴 -->
  <path d="M 60 76 Q 55 82 50 80" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M 60 76 Q 65 82 70 80" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>

  <!-- 胡须 -->
  <line x1="35" y1="74" x2="25" y2="72" stroke="#333" stroke-width="1" stroke-linecap="round"/>
  <line x1="35" y1="78" x2="25" y2="80" stroke="#333" stroke-width="1" stroke-linecap="round"/>
  <line x1="85" y1="74" x2="95" y2="72" stroke="#333" stroke-width="1" stroke-linecap="round"/>
  <line x1="85" y1="78" x2="95" y2="80" stroke="#333" stroke-width="1" stroke-linecap="round"/>

  <!-- 腮红 -->
  <circle cx="38" cy="72" r="5" fill="#FFCDD2" opacity="0.6"/>
  <circle cx="82" cy="72" r="5" fill="#FFCDD2" opacity="0.6"/>
</svg>`

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/**
 * 获取猫咪卡通头像 (供外部使用)
 * @param {Object} cat - 猫咪对象
 * @returns {Object} - 包含 avatar (SVG data URI), color, pattern
 */
export function getCartoonAvatar(cat) {
  const name = cat?.name || '小猫'
  const color = cat?.color || ''
  const avatar = generateCartoonCatSVG(name, color)
  const colorResult = getCatColorByName(name, color)
  const { primary, secondary } = colorResult
  const pattern = getCatPattern(name, color)
  return { avatar, color: primary, secondary, pattern }
}