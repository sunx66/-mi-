/**
 * 上门喂猫预约 mock 数据
 *
 * 字段说明：
 *  - id: 预约唯一 ID
 *  - catId / catName / catAvatarColor: 关联猫咪信息（轻量冗余，避免跨 store 频繁查询）
 *  - status: pending（待接单）/ accepted（已接单）/ completed（已完成）/ cancelled（已取消）
 *  - visitor: 接单人信息（status=pending 时为 null）
 *  - visitTime: 上门时间
 *  - address / latitude / longitude: 上门地点
 *  - contact: 联系方式
 *  - foodList: 需要喂的食物清单 [{ name, weight }]
 *  - remark: 备注
 *  - reward: 酬谢（可选）
 *  - createTime: 创建时间
 *  - packageLevel: 套餐等级 basic / standard / premium
 *  - price: 每日价格（元）
 *  - serviceDays: 服务天数
 *  - dailyCount: 每日上门次数
 *  - distance: 距离 km
 *  - publisher: 发布人信息（含 verified 认证、badges 标签、credit 信用）
 *  - checklist: 上门打卡清单 [{ id, name, uploaded }]
 *  - messages: 沟通消息列表 [{ id, senderId, senderName, content, createTime }]
 */

// 套餐选项常量
export const PACKAGE_OPTIONS = {
  basic: { name: '基础喂养套餐', price: 80, services: ['上门添猫粮', '更换饮用水', '简单清理食具水具'] },
  standard: { name: '标准看护套餐', price: 120, services: ['添粮换水', '彻底铲屎', '周边环境简单整理', '拍摄宠物状态反馈图'] },
  premium: { name: '全套尊享套餐', price: 180, services: ['全套喂养清洁', '短时陪玩互动', '宠物精神状态观察', '全屋水电门窗安全巡检', '多维度服务实拍反馈'] }
}

export const mockVisitList = [
  {
    id: 'visit_001',
    catId: 'cat_001',
    catName: '小橘',
    catAvatarColor: '#FFA726',
    status: 'completed',
    publisher: {
      id: 'user_002',
      name: '张大姐',
      avatarColor: '#ff8210',
      verified: true,
      badges: ['认证喂猫师'],
      credit: { fulfillmentRate: 95, praiseRate: 92, disputes: 1, totalOrders: 50 }
    },
    visitor: {
      id: 'user_001',
      name: '暖喵志愿者',
      avatarColor: '#ff8210'
    },
    visitTime: '2026-07-28T18:00:00',
    visitTimeLabel: '7月28日 18:00',
    address: '阳光小区 3 号楼后花园',
    latitude: 30.2741,
    longitude: 120.1551,
    contact: '138****8888',
    foodList: [
      { name: '猫粮', weight: 50 },
      { name: '清水', weight: 200 }
    ],
    remark: '小橘最近有点挑食，麻烦多留意一下吃粮情况',
    reward: '猫条一包',
    createTime: '2026-07-27T20:15:00',
    createTimeLabel: '3天前',
    packageLevel: 'premium',
    price: 180,
    serviceDays: 3,
    dailyCount: 1,
    distance: 1.2,
    checklist: [
      { id: 0, name: '上门前环境全景照', uploaded: true },
      { id: 1, name: '粮水投放完成对比照', uploaded: true },
      { id: 2, name: '猫砂清理前后对比照', uploaded: true },
      { id: 3, name: '宠物实时状态照', uploaded: true },
      { id: 4, name: '居家安全巡检收尾照', uploaded: true }
    ],
    messages: [
      { id: 'msg_0011', senderId: 'user_002', senderName: '张大姐', content: '小橘今天吃粮不错，已添水', createTime: '2026-07-28T18:30:00' },
      { id: 'msg_0012', senderId: 'user_001', senderName: '暖喵志愿者', content: '收到，辛苦了！', createTime: '2026-07-28T18:45:00' }
    ]
  },
  {
    id: 'visit_002',
    catId: 'cat_002',
    catName: '大黑',
    catAvatarColor: '#424242',
    status: 'accepted',
    publisher: {
      id: 'user_001',
      name: '暖喵志愿者',
      avatarColor: '#ff8210',
      verified: true,
      badges: ['认证喂猫师', '高履约信用师'],
      credit: { fulfillmentRate: 98, praiseRate: 96, disputes: 0, totalOrders: 86 }
    },
    visitor: {
      id: 'user_003',
      name: '小李同学',
      avatarColor: '#3b82f6'
    },
    visitTime: '2026-07-30T19:00:00',
    visitTimeLabel: '今天 19:00',
    address: '中心花园西侧凉亭',
    latitude: 30.2755,
    longitude: 120.1568,
    contact: 'App 内消息',
    foodList: [
      { name: '肉罐', weight: 80 },
      { name: '清水', weight: 150 }
    ],
    remark: '大黑比较亲人，可以直接喂，注意罐头开封后倒干净',
    reward: '',
    createTime: '2026-07-29T22:00:00',
    createTimeLabel: '昨天',
    packageLevel: 'standard',
    price: 120,
    serviceDays: 5,
    dailyCount: 2,
    distance: 0.8,
    checklist: [
      { id: 0, name: '上门前环境全景照', uploaded: true },
      { id: 1, name: '粮水投放完成对比照', uploaded: true },
      { id: 2, name: '猫砂清理前后对比照', uploaded: true },
      { id: 3, name: '宠物实时状态照', uploaded: false },
      { id: 4, name: '居家安全巡检收尾照', uploaded: false }
    ],
    messages: [
      { id: 'msg_0021', senderId: 'user_001', senderName: '暖喵志愿者', content: '小李今天19点记得上门', createTime: '2026-07-30T10:00:00' },
      { id: 'msg_0022', senderId: 'user_003', senderName: '小李同学', content: '好的，已出发', createTime: '2026-07-30T18:30:00' },
      { id: 'msg_0023', senderId: 'user_001', senderName: '暖喵志愿者', content: '注意罐头开封后倒干净', createTime: '2026-07-30T18:50:00' }
    ]
  },
  {
    id: 'visit_003',
    catId: 'cat_003',
    catName: '花花',
    catAvatarColor: '#FFE082',
    status: 'pending',
    publisher: {
      id: 'user_001',
      name: '暖喵志愿者',
      avatarColor: '#ff8210',
      verified: true,
      badges: ['认证喂猫师'],
      credit: { fulfillmentRate: 90, praiseRate: 88, disputes: 0, totalOrders: 23 }
    },
    visitor: null,
    visitTime: '2026-08-01T08:00:00',
    visitTimeLabel: '8月1日 08:00',
    address: '阳光小区南门快递柜旁',
    latitude: 30.2738,
    longitude: 120.1543,
    contact: 'App 内消息',
    foodList: [
      { name: '猫粮', weight: 40 },
      { name: '冻干', weight: 15 }
    ],
    remark: '花花最近在花园南门活动，早上 8 点投喂最佳',
    reward: '可顺便撸猫',
    createTime: '2026-07-30T09:30:00',
    createTimeLabel: '今天上午',
    packageLevel: 'basic',
    price: 80,
    serviceDays: 2,
    dailyCount: 1,
    distance: 2.5,
    checklist: [
      { id: 0, name: '上门前环境全景照', uploaded: false },
      { id: 1, name: '粮水投放完成对比照', uploaded: false },
      { id: 2, name: '猫砂清理前后对比照', uploaded: false },
      { id: 3, name: '宠物实时状态照', uploaded: false },
      { id: 4, name: '居家安全巡检收尾照', uploaded: false }
    ],
    messages: [
      { id: 'msg_0031', senderId: 'user_001', senderName: '暖喵志愿者', content: '花花早8点投喂最佳，期待接单', createTime: '2026-07-30T09:35:00' }
    ]
  }  ,
  {
    id: 'visit_004',
    catId: 'cat_004',
    catName: '咪咪',
    catAvatarColor: '#FF9800',
    status: 'pending',
    publisher: {
      id: 'user_004',
      name: '王阿姨',
      avatarColor: '#3b82f6',
      verified: true,
      badges: ['认证喂猫师', '高履约信用师'],
      credit: { fulfillmentRate: 97, praiseRate: 95, disputes: 0, totalOrders: 65 }
    },
    visitor: null,
    visitTime: '2026-08-02T10:00:00',
    visitTimeLabel: '8月2日 10:00',
    address: '和平路 12 号院',
    latitude: 30.2760,
    longitude: 120.1570,
    contact: '139****6666',
    foodList: [
      { name: '猫粮', weight: 60 },
      { name: '清水', weight: 200 }
    ],
    remark: '咪咪性格温顺，喜欢在后院晒太阳，注意不要喂牛奶',
    reward: '猫罐头一个',
    createTime: '2026-07-30T14:00:00',
    createTimeLabel: '2小时前',
    packageLevel: 'standard',
    price: 120,
    serviceDays: 4,
    dailyCount: 1,
    distance: 1.5,
    checklist: [
      { id: 0, name: '上门前环境全景照', uploaded: false },
      { id: 1, name: '粮水投放完成对比照', uploaded: false },
      { id: 2, name: '猫砂清理前后对比照', uploaded: false },
      { id: 3, name: '宠物实时状态照', uploaded: false },
      { id: 4, name: '居家安全巡检收尾照', uploaded: false }
    ],
    messages: []
  }
]
