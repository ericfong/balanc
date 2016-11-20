import Collection from 'nedb-promise'


function promiseToCallback(args) {
  return function(err, ret) {
    if (err) return args[1](err)
    args[0](ret)
  }
}


export default function PatchCollection(options) {
  const coll = new Collection(options)
  const nedbInstance = coll.nedb

  coll.operations = []
  coll.operationNumber = 0

  // hack via nedb-promise
  Object.assign(coll, {
    hook() {
    },
    setHook(hook) {
      this.hook = hook
    },

    _insertOperation(fn, args) {
      coll.operations.push({_id: coll.operationNumber++, fn, args})
      // persist operations

      // use promise to debounce
      if (this._promise) return
      this._promise = new Promise(resolve => setTimeout(resolve, 1))
      .then(() => this.hook(coll.operations))
      .then(newOps => {
        coll.operations = newOps || []

        this._promise = null
      })
    },

    insert(newDoc) {
      this._insertOperation('insert', [newDoc])

      return new Promise(function() {
        nedbInstance.insert(newDoc, promiseToCallback(arguments))
      })
    },

    async update(query, updateQuery, options) {
      this._insertOperation('update', [query, updateQuery, options])

      return new Promise(function() {
        nedbInstance.update(query, updateQuery, options, promiseToCallback(arguments))
      })
    },

    async remove(query, options) {
      this._insertOperation('remove', [query, options])

      return new Promise(function() {
        nedbInstance.remove(query, options, promiseToCallback(arguments))
      })
    },
  })

  return coll
}
