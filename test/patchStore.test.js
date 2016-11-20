import _ from 'lodash'
import should from 'should'

import patchStore from '../src/patchStore'


describe('patchStore', function() {
  it('nedb', async () => {
    const coll = patchStore()

    let lastOpsJson
    coll.setHook(async ops => {
      lastOpsJson = JSON.stringify(ops)

      // recorded operations
      should(ops).length(1)
      should(ops[0].fn).equal('insert')
      should(ops[0].args[0]).properties({hello: 'world'})
      should(ops[0]._id).equal(0)


      // api call
      const doneOpIds = [0]

      // filter logic still in setHook?
      return _.filter(ops, op => !_.includes(doneOpIds, op._id))
    })

    await coll.insert({hello: 'world'})
    await coll.find({})

    // hook is called
    should(coll.operations).length(0)
    should(JSON.parse(lastOpsJson)).length(1)
  })
})
