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

    _insertOperation(fn, args) {
      const p = coll.operations.insert({_id: coll.operationId++, fn, args})
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
        .then(doneOpIds => {
          finalRet = doneOpIds
          if (doneOpIds) {
            return this.__update({
              _id: {$in: doneOpIds},
            }, {
              $set: {
                doneAt: new Date(),
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
      return this._insertOperation('insert', [newDoc])
      .then(() => this.__insert(newDoc))
    },

    __update: coll.update,
    update(query, updateQuery, options) {
      return this._insertOperation('update', [query, updateQuery, options])
      .then(() => this.__update(query, updateQuery, options))
    },

    __remove: coll.remove,
    remove(query, options) {
      return this._insertOperation('remove', [query, options])
      .then(() => this.__remove(query, options))
    },
  })

  return coll
}
