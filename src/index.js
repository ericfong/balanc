import qs from 'querystring'
import _ from 'lodash'
import _fetch from 'isomorphic-fetch'

import _package from '../package.json'

const test = process.env.NODE_ENV !== 'production'

const defaultConfig = {
  apiUrl: process.env.BALANC_API || 'https://eddyy.com/v1',
  _ver: _package.version,

  domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
  // domainEmail: String // default from or to
  // domainKey: '', // 'signed key from server',
}
const ctxFields = Object.keys(defaultConfig)


export class Balanc {
  constructor(config) {
    this.conf = defaultConfig
    this.config(config)
  }



  // Exchange Level
  createDeal(body) {
    return this.fetch({method: 'POST', url: 'deal', body})
  }
  // exchangeAppend(body) {
  //   return this.fetch({method: 'POST', url: 'exchange/append', body})
  // }

  receiptUrl({_key}) {
    const {apiUrl, domain, domainKey} = this.conf
    const filename = `${encodeURIComponent(domain)}/${encodeURIComponent(_key)}.pdf`
    return `${apiUrl}/receipt/${filename}?${qs.stringify(_.pickBy({domainKey, test}))}`
  }



  // Payment Reminder
  getReceivables({from, to}) {
    return this.fetch({url: 'receivable', body: {from, to}})
  }

  billingUrl({from, to}) {
    const {apiUrl, domain, domainKey} = this.conf
    let filename = `${encodeURIComponent(domain)}/${encodeURIComponent(from)}`
    if (to) filename += `/${encodeURIComponent(to)}`
    return `${apiUrl}/billing/${filename}.pdf?${qs.stringify(_.pickBy({domainKey, test}))}`
  }



  // Account Level
  getDeals({from, to}) {
    return this.fetch({url: 'deal', body: {from, to}})
  }



  // util
  config(conf) {
    if (!conf) return this.conf
    _.assign(this.conf, _.pick(conf, ctxFields))
    return this
  }

  mixinConfig(ctx) {
    const method = ctx.method = ctx.method ? ctx.method.toUpperCase() : 'GET'
    const {apiUrl, ...conf} = this.conf
    const body = {
      ...conf,
      ...ctx.body,
    }
    if (method === 'GET') {
      ctx.url = `${apiUrl}/${ctx.url}?${qs.stringify(body)}`
    } else {
      ctx.url = `${apiUrl}/${ctx.url}`
      ctx.body = body
    }
    return ctx
  }

  fetch(ctx) {
    this.mixinConfig(ctx)

    if (ctx.method === 'GET') {
      // delete body
      delete ctx.body
    } else {
      // headers
      ctx.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-ver': ctx.body._ver,
        ...ctx.headers,
      }
      if (test) {
        ctx.headers['x-test'] = test
      }
      delete ctx.body._ver

      // body
      ctx.body = JSON.stringify(ctx.body)
    }

    return _fetch(ctx.url, ctx)
    .then(response => {
      if (response.status >= 200 && response.status < 400) {
        const contentType = response.headers.get('Content-Type')
        return _.startsWith(contentType, 'application/json') ? response.json() : response
      } else {
        var error = new Error(response.statusText)
        error.response = response
        throw error
      }
    })
  }
}

export default new Balanc()
