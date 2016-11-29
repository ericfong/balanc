import Collection from 'nedb-promise'


export default function PatchCollection({filename, autoload, disabledAutoFlush} = {}) {
  const coll = new Collection({
    filename,
    autoload,
  })

  coll.operations = new Collection({
    filename: filename + '.ops',
    autoload,
  })
  coll.operationId = 0

  coll.disabledAutoFlush = disabledAutoFlush

  // hack via nedb-promise
  Object.assign(coll, {
    hook() {
    },
    setHook(hook) {
      this.hook = hook
    },

    _insertOperation(operation) {
      operation._id = coll.operationId++
      operation.createdAt  = new Date()
      const p = coll.operations.insert(operation)
      if (!coll.disabledAutoFlush) {
        p.then(() => this.flushOperations())
      }
      return p
    },

    flushWait() {
      return this._promise
    },

    flushOperations() {
      // use promise to debounce
      if (!this._promise) {
        let finalRet
        this._promise = coll.operations.find({})
        .then(ops => this.hook(ops))
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
    },

    __insert: coll.insert,
    insert(newDoc) {
      return this._insertOperation({op: 'insert', insert: newDoc})
      .then(() => this.__insert(newDoc))
    },

    __update: coll.update,
    update(query, update, options) {
      return this._insertOperation({op: 'update', query, update, options})
      .then(() => this.__update(query, update, options))
    },
    updateById(updateId, update, options) {
      return this._insertOperation({op: 'updateById', updateId, update, options})
      .then(() => this.__update({_id: updateId}, update, options))
    },

    __remove: coll.remove,
    remove(query, options) {
      return this._insertOperation({op: 'remove', query, options})
      .then(() => this.__remove(query, options))
    },
  })

  return coll
}
