// global increment only number
let _lastNumber
export default function genTmpNumber() {
  let id = Date.now()
  if (id === _lastNumber) id ++
  _lastNumber = id
  return id
}
