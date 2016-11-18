import _ from 'lodash'
import jsonpatch from 'fast-json-patch'

export default class PatchStore {
  // only persistent
  data = {}
  ops = []
  archives = {}

  patch(ops) {
    // add timestamp/number to ops
    this.ops = this.ops.concat(ops)
    // emit event
    return jsonpatch.apply(this.data, ops)
  }

  patchDone(doneOps) {
    // delete ops based on number
  }

  dataSet(newData, oldData) {
    Object.assign(this.data, newData)
  }

  get(key) {
    if (!key) return this.data
    return this.data[key]
  }

  // // whole obj put (covnert to json patch)
  // set(key, value) {
  //   this.patches.push({op: 'replace', path: `/${key}`, value})
  //   this.archives[key] = this.store[key]
  //   this.store[key] = value
  // }

  // // mongo style (convert to json patch)
  // update({$set, $add}) {
  //   // to patches
  //   const _patches = []
  //   this.patch(_patches)
  // }
}
