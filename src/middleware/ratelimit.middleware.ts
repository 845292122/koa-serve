import KoaRatelimit from 'koa-ratelimit'

const db = new Map()

/**
 * koa限流中间件
 * driver memory or redis [redis]
 * db redis connection instance or Map instance (memory)
 * duration of limit in milliseconds [3600000]
 * errorMessage custom error message
 * id id to compare requests [ip]
 * namespace prefix for storage driver key name [limit]
 * headers custom header names
 * max max requests within duration [2500]
 * disableHeader set whether send the remaining, reset, total headers [false]
 * remaining remaining number of requests ['X-RateLimit-Remaining']
 * reset reset timestamp ['X-RateLimit-Reset']
 * total total number of requests ['X-RateLimit-Limit']
 * whitelist if function returns true, middleware exits before limiting
 * blacklist if function returns true, 403 error is thrown
 * throw call ctx.throw if true
 */
export const ratelimitMiddleware = KoaRatelimit({
  driver: 'memory',
  db: db,
  duration: 60 * 1000,
  errorMessage: 'Sometimes You Just Have to Slow Down.',
  id: ctx => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  },
  max: 100,
  disableHeader: false
})
