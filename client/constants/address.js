import Enum from 'enum'

// 解析上限
export const ANALYTICS_LIMIT = 50000
// 解析 API の一度の呼び出しでの最大指定数
export const ANALYTICS_LIMIT_PER_REQUEST = 10000
// 住所ポリゴン表示上限
export const POLYGON_LIMIT = 5000
// ポリゴン API の一度の呼び出しでの最大指定数
export const POLYGON_LIMIT_PER_REQUEST = 100

export const addressLevel = new Enum({ level1: 1, level2: 2, level3: 3, level4: 4 })

export const addressLevelName = new Enum({
  level1: '都道府県',
  level2: '市区町村',
  level3: '大字・町名',
  level4: '字・丁目',
})
