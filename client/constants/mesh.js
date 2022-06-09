import Enum from 'enum'

export const meshLevel = new Enum({
  level80000: 80000,
  level10000: 10000,
  level5000: 5000,
  level2000: 2000,
  level1000: 1000,
  level500: 500,
  level250: 250,
  level125: 125,
})

export const meshLevelName = new Enum({
  level80000: '80kmメッシュ',
  level10000: '10kmメッシュ',
  level5000: '5kmメッシュ',
  level2000: '2kmメッシュ',
  level1000: '1kmメッシュ',
  level500: '500mメッシュ',
  level250: '250mメッシュ',
  level125: '125mメッシュ',
})
