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
 */

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
      avatarColor: '#ff8210'
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
    createTimeLabel: '3天前'
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
      avatarColor: '#ff8210'
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
    createTimeLabel: '昨天'
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
      avatarColor: '#ff8210'
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
    createTimeLabel: '今天上午'
  }
]
