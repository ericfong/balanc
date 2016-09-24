import querystring from 'querystring'
import _ from 'lodash'
import _fetch from 'isomorphic-fetch'

import _package from '../package.json'


const defaultConfig = {
  apiUrl: process.env.BALANC_API || 'https://eddyy.com/v1',
  _ver: _package.version,
  _try: process.env.NODE_ENV !== 'production',

  domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
  // domainKey: '', // 'signed key from server',
}
const ctxFields = Object.keys(defaultConfig)


export class Balanc {
  constructor(config) {
    this.conf = defaultConfig
    this.config(config)
  }


  exchange(body) {
    return this.fetch({method: 'POST', url: 'exchange', body})
  }

  receiptUrl({from, number}) {
    const {apiUrl, domain, _try, domainKey} = this.conf
    const filename = `${encodeURIComponent(domain)}/${encodeURIComponent(from)}/${encodeURIComponent(number)}.pdf`
    const query = {domainKey, _try}
    return `${apiUrl}/receipt/${filename}?${querystring.stringify(_.pickBy(query))}`
  }

  getReceipts({from, to}) {
    return this.fetch({url: 'receipt', body: {from, to}})
  }

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
      ctx.url = `${apiUrl}/${ctx.url}?${querystring.stringify(body)}`
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
        'x-env': ctx.body._try,
        ...ctx.headers,
      }
      delete ctx.body._ver
      delete ctx.body._try

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
