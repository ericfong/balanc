import qs from 'querystring'
import _ from 'lodash'
import _fetch from 'isomorphic-fetch'

import _package from '../package.json'
import {normalizeDeal, markArrive} from './deal'
import createPdf from './createPdf'
import renderReceipt from './receipt'


const test = process.env.NODE_ENV === 'test'


const defaultConfig = {
  apiUrl: process.env.BALANC_API || 'https://eddyy.com/api',
  _ver: _package.version,

  domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
  domainEmail: '', // default from or to
  // domainKey: '', // 'signed key from server',
}
const ctxFields = Object.keys(defaultConfig)


// global increment only number
let _lastNumber
function getNumber() {
  let id = Date.now()
  if (id === _lastNumber) id ++
  _lastNumber = id
  return id
}


export class Balanc {

  constructor(config) {
    this.conf = defaultConfig
    this.config(config)
  }

  // operations
  pendingDeals = []
  async _postQueue(deal) {
    // enqueue in pendingDeals array
    const lastNumber = _lastNumber
    const number = getNumber()
    Object.assign(deal, {
      lastNumber,
      number,
      _id: `Tmp/${number}`,
    })
    this.pendingDeals.push(deal)

    try {
      // upload all pendingDeals
      const feedbacks = await this.fetch({method: 'POST', url: 'batch', body: {pendingDeals: this.pendingDeals}})
      _.pullAllBy(this.pendingDeals, _.filter(feedbacks, {type: 'done'}), 'number')
      // just return the current pending result
      const feedback = _.find(feedbacks, {number: deal.number})
      return feedback.output
    } catch(err) {
      // if ECONN REFUSED, just return the tmp deal
      // err.response means any of fetch error
      if (err.code === 'ECONNREFUSED' || err.message === 'Not Found' || err.response) {
        return deal
      }
      throw err
    }
  }

  findPendingDeal(_id) {
    return _.find(this.pendingDeals, {_id})
  }



  async createDeal(body) {
    const deal = normalizeDeal(body)
    deal.type = 'deal'
    return await this._postQueue(deal)
  }

  async markArrive(dealId, itemKeys) {
    const deal = _.find(this.pendingDeals, deal => deal._id === dealId)
    if (deal) {
      markArrive(deal, itemKeys)
    } else {
      const operation = {
        type: 'markArrive',
        dealId,
        itemKeys,
      }
      return await this._postQueue(operation)
    }
  }

  renderReceipt(pendingDeal) {
    // TODO get template from localStorage
    return renderReceipt(pendingDeal, {locale: 'en'})
  }

  receiptUrl({_id}) {
    const pendingDeal = this.findPendingDeal(_id)
    if (pendingDeal) {
      if (!this.renderReceipt) throw new Error('no this.renderReceipt')
      const receiptDefinition = this.renderReceipt(pendingDeal)
      return createPdf(receiptDefinition).getUrl()
    }

    const {apiUrl, domain, domainKey} = this.conf
    const filename = `${encodeURIComponent(domain)}/${_id}.pdf`
    return Promise.resolve(`${apiUrl}/receipt/${filename}?${qs.stringify(_.pickBy({domainKey, test}))}`)
  }


  openWindow({target = '_blank'} = {}, asyncFunc) {
    // we have to open the window immediately and store the reference otherwise popup blockers will stop us
    const win = window.open('', target)
    return asyncFunc()
    .then(url => {
      win.location.href = url
    })
    .catch(err => {
      win.close()
      throw err
    })
  }


  // Payment Reminder
  getReceivables({from, to}) {
    return this.fetch({url: 'receivable', body: {from, to}})
  }

  billUrl({from, to}) {
    const {apiUrl, domain, domainKey} = this.conf
    const filename = `${encodeURIComponent(domain)}/${encodeURIComponent(from)}/${encodeURIComponent(to)}`
    return `${apiUrl}/bill/${filename}.pdf?${qs.stringify(_.pickBy({domainKey, test}))}`
  }



  // Account Level
  getDeals({from, to}) {
    return this.fetch({url: 'deal', body: {from, to}})
  }

  getAccount({user, account, field}) {
    return this.fetch({url: 'account', body: {user, account, field}})
  }

  accountExcelUrl({user, account, field}) {
    const {apiUrl, domain, domainKey} = this.conf
    let filename = `${encodeURIComponent(domain)}/${encodeURIComponent(user)}/${encodeURIComponent(account)}`
    if (field) {
      filename += `/${encodeURIComponent(field)}`
    }
    return `${apiUrl}/bill/${filename}.xlsx?${qs.stringify(_.pickBy({domainKey, test}))}`
  }



  // util
  config(conf) {
    if (!conf) return this.conf
    _.assign(this.conf, _.pick(conf, ctxFields))
    // TODO download receipt template from cloud
    return this
  }

  _mixinConfig(ctx) {
    const method = ctx.method = ctx.method ? ctx.method.toUpperCase() : 'GET'
    const mixed = {...this.conf, ...ctx.body}
    const {apiUrl, ...body} = mixed
    if (method === 'GET') {
      ctx.url = `${apiUrl}/${ctx.url}?${qs.stringify(body)}`
    } else {
      ctx.url = `${apiUrl}/${ctx.url}`
      ctx.body = body
    }
    return ctx
  }

  fetch(ctx) {
    this._mixinConfig(ctx)

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
