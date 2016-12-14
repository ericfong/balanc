import _ from 'lodash'
// import sethub from 'reget/lib/sethub'
import {normalize, normalizeTransfer} from './model/exchange'


// persist records, flush
export default class LocalStore {

  constructor() {
    this.operationId = 0
    this.exchanges = {}
    this.operations = []
  }

  getExchange(id) {
    return id ? this.exchanges[id] : this.exchanges
  }

  insertExchange(data) {
    const newEx = normalize(data)
    const exchangeId = newEx._id
    this.exchanges[newEx._id] = newEx

    this._addQueue({exchangeId, fn: 'insertExchange', exchange: newEx})
    return newEx
  }

  setTransfer(exchangeId, transferIndex, set) {
    const ex = this.exchanges[exchangeId]
    Object.assign(ex.transfers[transferIndex], set)

    this._addQueue({exchangeId, fn: 'setTransfer', transferIndex, set})
    return ex
  }

  appendTransfers(exchangeId, transfers) {
    const ex = this.exchanges[exchangeId]
    for (let i = 0, ii = transfers.length; i < ii; i++) {
      transfers[i] = normalizeTransfer(transfers[i], transfers[i - 1] || ex.transfers[ex.transfers.length - 1])
    }
    ex.transfers = ex.transfers.concat(transfers)

    this._addQueue({exchangeId, fn: 'appendTransfers', transfers})
    return ex
  }
  // replaceTransfer


  _addQueue(operation) {
    operation._id = `${this.operationId++}-${operation.exchangeId}`
    operation.createdAt  = new Date()
    this.operations.push(operation)

    this.save()
    this.flush()
  }

  doFlush(body) {
    return this.fetch({method: 'POST', url: 'operation', body})
  }

  flush() {
    // use promise to debounce
    if (!this._promise) {
      const operations = this.operations.slice()
      let finalRet
      const body = {operations}

      this._promise = this.doFlush(body)
      .then(ret => {
        if (ret && ret.ok) {
          // set postedAt
          _.each(operations, op => {
            op.postedAt = new Date()
          })
          // set doneAt
          _.each(ret.doneIds, _id => {
            _.find(operations, {_id}).doneAt = new Date()
          })

          // redirect exchanges
          _.each(ret.newExchanges, (newEx, tmpId) => {
            delete this.exchanges[tmpId]
            this.exchanges[newEx._id] = newEx
          })
          // console.log(ret.newExchanges, this.exchanges)

          this.save()
        }
        // return both operations & http ret
        finalRet = Object.assign(body, ret)
      })
      .catch(err => {
        // ECONNREFUSED = Cannot reach server
        // Not Found = api is too old
        if (err.code === 'ECONNREFUSED' || err.message === 'Not Found' || err.response) {
          // console.warn(err)
        } else {
          console.error(err)
        }
        finalRet = err instanceof Error ? err : new Error(err)
      })
      .then(() => {
        this._promise = null
        return finalRet
      })
    }
    return this._promise
  }

  waitFlush() {
    return this._promise
  }


  load() {
    if (global.localStorage) {
      const data = JSON.parse(localStorage.getItem('balanc'))
      Object.assign(this, data)
    }
  }

  save() {
    if (global.localStorage) {
      const data = JSON.stringify(this)
      localStorage.setItem('balanc', data)
    }
  }
}
