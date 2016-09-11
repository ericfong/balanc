import querystring from 'querystring'
import _ from 'lodash'
import _fetch from 'isomorphic-fetch'

import _package from '../package.json'


const defaultCtx = {
  // env: 'development' | 'production',
  env: process.env.NODE_ENV,
  apiUrl: process.env.BALANC_API || 'https://eddyy.com/v1',
  libVersion: _package.version,

  domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
  domainEmail: undefined,

  // NOTE individual customer or pos controller
  // NOTE set permission
  userJwt: undefined,

  // currency: 'HKD',
  currency: undefined,
}

const ctxFields = Object.keys(defaultCtx)


export class Balanc {
  constructor(context) {
    this._context = defaultCtx
    this.setContext(context)
  }

  setContext(context) {
    _.assign(this._context, _.pick(context, ctxFields))
    return this
  }

  fetch(pathname, body, option, context) {
    const {env, apiUrl, ...apiFields} = {...this._context, ...context}
    const {method} = option

    const _opt = _.merge({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }, option)

    let query = ''
    const json = {
      ...body,
      ...apiFields,
    }
    if (method === 'GET') {
      query = '?' + querystring.stringify(json)
    } else {
      _opt.body = JSON.stringify(json)
    }

    if (env === 'production') {
      // console.warn()
    }

    return _fetch(`${apiUrl}/${pathname}${query}`, _opt)
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

function addMethod(funcName, httpUrl, httpMethod) {
  Balanc.prototype[funcName] = function(body, context) {
    return this.fetch(httpUrl, body, {method: httpMethod}, context)
  }
}

addMethod('exchange', 'exchange', 'POST')
addMethod('getExchanges', 'exchange', 'GET')
addMethod('getAccount', 'account', 'GET')


export default new Balanc()
