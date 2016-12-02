import Collection from 'nedb-promise'

export class LocalStore {
  operationId = 0
  disabledAutoFlush = false

  constructor() {
    this.exchanges = new Collection({filename: 'nedb/exchanges', autoload: true})
    this.operations = new Collection({filename: 'nedb/exchanges.ops', autoload: true})
  }


  insertExchange(newDoc) {
    return this.exchanges.insert(newDoc)
    .then(exchange => {
      this._insertOperation({fn: 'insertExchange', exchangeId: exchange._id, exchange})
      return exchange
    })
  }

  setTransfer(exchangeId, transferIndex, set) {
    return this.exchanges.update({_id: exchangeId}, {
      $set: {
        [`transfers.${transferIndex}`]: set,
      },
    })
    .then(ret => {
      this._insertOperation({fn: 'setTransfer', exchangeId, transferIndex, set})
      return ret
    })
  }

  appendTransfers(exchangeId, transfers) {
    return this.exchanges.update({_id: exchangeId}, Array.isArray(transfers) ? {$pushAll: transfers} : {$push: transfers})
    .then(ret => {
      this._insertOperation({fn: 'appendTransfers', exchangeId, transfers})
      return ret
    })
  }
  // replaceTransfer



  _insertOperation(operation) {
    operation._id = this.operationId++
    operation.createdAt  = new Date()
    const p = this.operations.insert(operation)
    if (!this.disabledAutoFlush) {
      p.then(() => this.flushOperations())
    }
    return p
  }

  doFlush(operations) {
    return this.fetch({method: 'POST', url: 'operations', body: {operations}})
    .then(ret => {
      return ret.postedIds
    })
  }

  flush() {
    // use promise to debounce
    if (!this._promise) {
      let finalRet
      this._promise = this.operations.find({})
      .then(ops => this.doFlush(ops))
      .then(postedIds => {
        finalRet = postedIds
        if (postedIds) {
          return this.__update({
            _id: {$in: postedIds},
          }, {
            $set: {
              postedAt: new Date(),
            },
          })
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

  flushWait() {
    return this._promise
  }
}
