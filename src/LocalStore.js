import _ from 'lodash'
// import sethub from 'reget/lib/sethub'
import {normalize, normalizeTransfer} from './model/exchange'


// persist records, flush
export default class LocalStore {

  constructor() {
    this.operationId = 0
    this.disabledAutoFlush = false
    this.exchanges = {}
    this.operations = []
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
    operation._id = `${operation.exchangeId}-${this.operationId++}`
    operation.createdAt  = new Date()
    this.operations.push(operation)

    this.save()
    this.flush()
  }

  doFlush(operations) {
    return this.fetch({method: 'POST', url: 'operations', body: {operations}})
  }

  flush() {
    // use promise to debounce
    if (!this._promise) {
      let finalRet
      this._promise = this.doFlush(this.operations)
      .then(({postedIds}) => {
        finalRet = postedIds
        if (postedIds) {
          _.each(postedIds, postedId => {
            const op = _.find(this.operations, {_id: postedId})
            op.postedAt = new Date()
          })
          this.save()
        }
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
