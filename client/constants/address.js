import Enum from 'enum'

export const addressLevel = new Enum({ level1: 1, level2: 2, level3: 3, level4: 4 })

export const addressLevelName = new Enum({
  level1: '都道府県',
  level2: '市区町村',
  level3: '大字・町',
  level4: '丁目・字等',
})
