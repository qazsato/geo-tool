import Enum from 'enum'

export const meshLevel = new Enum({ level1: 1, level2: 2, level3: 3, level4: 4, level5: 5, level6: 6 })

export const meshLevelName = new Enum({
  level1: '1次メッシュ(80km)',
  level2: '2次メッシュ(10km)',
  level3: '3次メッシュ(1km)',
  level4: '4次メッシュ(500m)',
  level5: '5次メッシュ(250m)',
  level6: '6次メッシュ(125m)',
})
