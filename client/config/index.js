import config from './default.json'
import development from './development.json'
import production from './production.json'

const c = process.env.NODE_ENV === 'production' ? { ...config, ...production } : { ...config, ...development }

export default c
