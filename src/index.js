import querystring from 'querystring'
import _ from 'lodash'
import _fetch from 'isomorphic-fetch'

import _package from '../package.json'


const defaultCtx = {
  apiUrl: process.env.BALANC_API || 'https://eddyy.com/v1',
  libVersion: _package.version,

  domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
  // apiKey: 'signed key from server',

  // NOTE individual customer or pos controller
  // NOTE set permission
  // userJwt: undefined,
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

  fetch(pathname, body, option) {
    const {apiUrl, ...contextData} = this._context
    const method = option.method ? option.method.toUpperCase() : 'GET'

    // merge default option
    _.set(option, ['headers', 'Content-Type'], 'application/json')
    option.headers['Accept'] = option.accept || 'application/json'

    let query = ''
    const json = {
      ...body,
      ...contextData,
    }
    if (method === 'GET' || method === 'HEAD') {
      query = '?' + querystring.stringify(json)
    } else {
      option.body = JSON.stringify(json)
    }

    const url = `${apiUrl}/${pathname}${query}`

    if (option.output === 'url') {
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
}

function addMethod(funcName, httpUrl, methodOption) {
  Balanc.prototype[funcName] = function(body, option) {
    return this.fetch(httpUrl, body, option ? {...methodOption, ...option} : methodOption)
  }
}

addMethod('transfer', 'transfer', {method: 'POST'})
addMethod('getTransfers', 'transfer', {method: 'GET'})
addMethod('getAccount', 'account', {method: 'GET'})
addMethod('getInvoice', 'invoice', {method: 'GET'})


export default new Balanc()
