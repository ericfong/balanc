import Collection from 'nedb-promise'


export default function PatchCollection(options = {}) {
  const coll = new Collection(options)

  coll.operations = new Collection({
    ...options,
    filename: options.filename + '.ops',
  })
  coll.operationId = 0

  // hack via nedb-promise
  Object.assign(coll, {
    hook() {
    },
    setHook(hook) {
      this.hook = hook
    },

    _insertOperation(fn, args) {
      return coll.operations.insert({_id: coll.operationId++, fn, args})
      .then(() => this.flushOperations())
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
