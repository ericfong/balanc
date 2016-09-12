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

  fetch(pathname, body, option, context) {
    const {apiUrl, ...apiFields} = {...this._context, ...context}
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
    if (method === 'GET' || method === 'GET_URL') {
      query = '?' + querystring.stringify(json)
    } else {
      _opt.body = JSON.stringify(json)
    }

    const url = `${apiUrl}/${pathname}${query}`

    if (method === 'GET_URL') {
      return url
    }

    return _fetch(url, _opt)
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

function addMethod(funcName, httpUrl, option) {
  Balanc.prototype[funcName] = function(body, context) {
    return this.fetch(httpUrl, body, option, context)
  }
}

addMethod('transfer', 'transfer', {method: 'POST'})
addMethod('getTransfers', 'transfer', {method: 'GET'})
addMethod('getAccount', 'account', {method: 'GET'})
addMethod('getInvoice', 'invoice', {method: 'GET'})


export default new Balanc()
