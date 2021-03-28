import Enum from 'enum'

// 解析上限
export const ANALYSYS_LIMIT = 10000
// ポリゴン表示上限
export const POLYGON_LIMIT = 1000

export const addressLevel = new Enum({ level1: 1, level2: 2, level3: 3, level4: 4 })

export const addressLevelName = new Enum({
  level1: '都道府県',
  level2: '市区町村',
  level3: '大字・町名',
  level4: '字・丁目',
})
