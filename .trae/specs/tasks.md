# 暖喵帮扶项目 - 开发任务清单

## 📅 最后更新
2026-07-26

---

## ✅ 已完成页面

### 1. 首页（pages/index/index.vue）
**状态：** ✅ 已完成并通过验证

**功能清单：**
- [x] 自定义导航栏（标题"暖喵帮扶"）
- [x] 搜索栏（猫咪昵称、位置搜索，带清除按钮）
- [x] 筛选标签（全部/待投喂/待救助/新发现/最近更新）
- [x] 地图区域（uni-app map 组件，H5 地图 Key 占位）
- [x] 地图标记点（猫咪头像 + 健康状态颜色标识）
- [x] 健康状态颜色：健康（绿色）、需关注（橙棕色）、需救助（红色）
- [x] 地图覆盖层（地图加载失败时的圆形布局回退）
- [x] 范围选择器（0.5km / 1km / 2km）
- [x] 定位功能（用户位置标记 + 重新定位按钮）
- [x] 路线图（选中猫咪后绘制用户到猫咪的 polyline）
- [x] 路线信息栏（显示猫咪名称 + 距离）
- [x] 附近猫咪卡片列表（横向滚动，卡通/真实头像自动切换）
- [x] FAB 按钮（新增猫咪）
- [x] 底部 TabBar（首页/公告/指南/我的）

**UI 元素：**
- 搜索框：圆角白底 + 搜索图标
- 筛选标签：圆角胶囊样式，选中态品牌色高亮
- 地图标记：圆形头像 + 彩色健康状态边框 + 距离标签
- 猫咪卡片：头像 + 名字 + 颜色 + 体型 + 距离 + 状态徽章
- 定位按钮：圆形白底，地图左上角

---

## 🛠 已修复的 Bug

### Bug 1: 筛选标签点击无反应
- **原因：** 筛选标签默认隐藏（v-if="showFilter"），且附近猫咪列表未应用筛选逻辑
- **修复：** 移除 v-if，创建 filteredNearbyCats 计算属性，让卡片列表根据筛选条件更新
- **文件：** `src/pages/index/index.vue`

### Bug 2: 地图 Key 未配置导致地图无法加载
- **原因：** manifest.json 中未配置地图 API Key
- **修复：** 在 manifest.json 的 h5.sdkConfigs.map 中添加 provider 和 key 配置（占位符）
- **文件：** `src/manifest.json`

### Bug 3: 猫咪照片无法显示
- **原因：** 图片路径错误或组件中未正确绑定 src 属性
- **修复：** 在 NmCatCard 组件中使用 `:src` 绑定 `cat.photos[0]`，确保照片 URL 正确，添加 `@error` 事件处理
- **文件：** `src/components/NmCatCard.vue`

### Bug 4: npm install 证书错误（UNABLE_TO_GET_ISSUER_CERT_LOCALLY）
- **原因：** npm registry 证书问题
- **修复：** 设置 `npm config set strict-ssl false`，创建 `.npmrc` 文件配置
- **文件：** `.npmrc`

### Bug 5: 小橘头像显示真实照片而非卡通头像
- **原因：** mock 数据中 `avatarType` 为 `'photo'`，导致优先显示 Unsplash 真实照片
- **修复：** 将 `avatarType` 改为 `'cartoon'`
- **文件：** `src/mock/cat.js`

### Bug 6: 颜色匹配优先级错误
- **原因：** 颜色匹配按规则数组顺序匹配，"花花"（color: '三花'）因为名字里的"花"字先匹配到橘猫规则
- **修复：** 改为优先匹配更长（更具体）的关键词
- **文件：** `src/utils/cartoonCat.js`

### Bug 7: 首页布局重叠（桌面浏览器）
- **原因：** 使用 `position: fixed` + 固定像素值手动计算布局位置，不同屏幕下发生重叠
- **修复：** 改用 flex 布局 + 正常文档流，页面容器使用 `paddingTop` 动态留白
- **文件：** `src/pages/index/index.vue`

---

## 🎨 猫咪头像系统

### 卡通头像生成（utils/cartoonCat.js）
- 根据猫咪名字自动推断颜色
- 支持花纹：橘猫、三花、奶牛、狸花、玳瑁等
- 颜色匹配优先级：更长关键词优先

### 头像颜色映射
| 猫咪 | 颜色描述 | 主色 | 备注 |
|------|----------|------|------|
| 小橘 | 橘白 | `#FFA726` | 橘色 |
| 花花 | 三花 | `#FFE082` / `#FFFFFF` / `#D7CCC8` | 浅黄+白+浅棕 |
| 大黑 | 黑色 | `#424242` | 黑色 |
| 小白 | 白色 | `#F5F5F5` | 白色 |
| 三花 | 三花 | `#212121` / `#FFFFFF` / `#FFD54F` | 黑+白+黄 |

### 头像类型
- `avatarType: 'cartoon'` → 使用卡通 SVG 头像（默认）
- `avatarType: 'photo'` → 使用真实猫咪照片

### 头像显示优先级
1. 若 `avatarType === 'photo'` 且有照片 → 显示真实照片
2. 否则 → 生成对应颜色的卡通头像
3. 再失败 → 回退 emoji 🐱

---

## ⚙️ 技术架构

### 技术栈
- **框架：** uni-app (Vue3) + Pinia
- **样式：** SCSS + rpx 响应式单位
- **构建：** Vite 5 + uni-build
- **H5 开发服务器：** Vite dev server (端口 8084)

### 目录结构
```
src/
├── api/            # API 接口层
├── components/     # 公共组件
│   ├── NmCatCard.vue    # 猫咪卡片组件
│   └── NmStatusTag.vue  # 状态标签组件
├── mock/           # Mock 数据
│   ├── cat.js           # 猫咪 mock 数据
│   └── community.js     # 社区 mock 数据
├── pages/          # 页面
├── static/         # 静态资源
│   ├── icons/           # TabBar 图标
│   └── markers/         # 地图标记 SVG
├── store/          # Pinia 状态管理
│   ├── cat.js           # 猫咪状态
│   ├── community.js     # 社区状态
│   └── user.js          # 用户状态
├── styles/         # 全局样式
│   ├── global.scss      # 全局 SCSS
│   └── variables.scss    # SCSS 变量
├── utils/          # 工具函数
│   ├── cartoonCat.js    # 卡通头像生成
│   ├── location.js      # 定位计算
│   ├── marker.js        # 地图标记生成
│   └── toast.js         # Toast 提示
├── App.vue
├── main.js
├── manifest.json
└── pages.json
```

### 设计规范
- **主色调：** 暖橘色 `#FF8210`（品牌色）
- **健康状态：**
  - 健康 → 绿色 `#4CAF50`
  - 需关注 → 橙棕色 `#FF9800`
  - 需救助 → 红色 `#F44336`
- **字体大小：** 使用 SCSS 变量统一管理
- **间距/圆角：** 使用 rpx 单位适配

---

## 📋 下一页开发标准

### 下一个优先页面：猫咪档案页（pages/cat-profile/index.vue）

**开发标准：**

#### 1. 视觉设计
- 延续首页的暖色调设计风格
- 顶部大图展示猫咪头像（支持卡通/真实照片切换）
- 圆角卡片展示详细信息
- 状态徽章与首页保持一致

#### 2. 功能要求
- [ ] 猫咪基本信息展示（名字、颜色、体型、性别、性格）
- [ ] 健康状态展示（当前状态 + 消毒/怀孕状态）
- [ ] 照片相册（支持多张照片展示）
- [ ] 喂养记录时间线
- [ ] 特征标签展示
- [ ] 位置信息
- [ ] 编辑功能入口

#### 3. 数据要求
- 使用 Pinia store (`catStore`) 获取猫咪数据
- 支持真实照片上传后同步更新 `avatarType` 为 `'photo'`
- 保留卡通头像作为默认展示

#### 4. 交互要求
- 点击状态标签可跳转喂养检查页
- 支持从首页卡片点击跳转到猫咪档案
- 返回导航支持

#### 5. 代码规范
- 使用 `<script setup>` + Composition API
- 组件命名以 `Nm` 前缀（暖喵）
- 使用 SCSS + rpx 单位
- 颜色/间距引用 `variables.scss` 变量
- 添加必要的注释

#### 6. 验证标准
- [ ] `npm run build:h5` 构建成功
- [ ] `npm run dev:h5` 启动后页面正常渲染
- [ ] 卡通头像与真实照片正确切换
- [ ] 响应式布局在不同屏幕尺寸下正常显示
- [ ] 无控制台错误（除 Map Key 占位警告）

---

## 🚀 常用命令

```bash
# 安装依赖
npm install

# 开发 H5
npm run dev:h5

# 构建 H5
npm run build:h5

# 开发微信小程序
npm run dev:mp-weixin

# 构建微信小程序
npm run build:mp-weixin
```

---

## 📝 备注

- H5 地图功能需要配置高德/腾讯地图 API Key（当前为占位符）
- 定位功能在 H5 端可能因浏览器权限限制而失败，已做降级处理
- 所有猫咪头像均使用卡通 SVG 作为默认，真实照片上传后自动切换
- 项目 Git 仓库：`https://github.com/sunx66/-mi-.git`
