import querystring from 'querystring'
import _ from 'lodash'
import _fetch from 'isomorphic-fetch'

import _package from '../package.json'


const defaultCtx = {
  env: process.env.NODE_ENV,
  apiUrl: process.env.BALANC_API || 'https://eddyy.com/v1',
  libVersion: _package.version,

  domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
  domainKey: '', // 'signed key from server',
}
const ctxFields = Object.keys(defaultCtx)


export class Balanc {
  constructor(context) {
    this.context = defaultCtx
    this.setContext(context)
  }

  setContext(context) {
    _.assign(this.context, _.pick(context, ctxFields))
    return this
  }

  fetch(pathname, data, option) {
    const {apiUrl, libVersion, env, ...contextData} = this.context
    const method = option.method ? option.method.toUpperCase() : 'GET'

    // merge default option
    _.set(option, ['headers', 'Content-Type'], 'application/json')
    option.headers['Accept'] = option.accept || 'application/json'
    option.headers['X-Lib-Ver'] = libVersion
    option.headers['X-Env'] = env

    let query = ''
    const json = {
      ...data,
      ...contextData,
    }
    if (method === 'GET' || method === 'HEAD') {
      query = '?' + querystring.stringify(json)
    } else {
      option.body = JSON.stringify(json)
    }

    const url = `${apiUrl}/${pathname}${query}`

    // TODO still need this?
    if (method === 'GET' && (option.$out === 'url' || (data && data.$out === 'url'))) {
      return url
    }

    return _fetch(url, option)
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

  printReceipt(data) {
    this.fetch('receipt', data, {method: 'GET', $out: 'url'})
  }
}

function addMethod(funcName, httpUrl, methodOption) {
  Balanc.prototype[funcName] = function(body) {
    return this.fetch(httpUrl, body, methodOption)
  }
}

addMethod('exchange', 'exchange', {method: 'POST'})

// addMethod('getTransfers', 'transfer', {method: 'GET'})
// addMethod('getBalance', 'balance', {method: 'GET'})


export default new Balanc()
