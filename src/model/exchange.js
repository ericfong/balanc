import _ from 'lodash'
// import shortid from 'shortid'

import {validateExchange} from './validators'
import {transferSchema} from './schemas'

const transferCarryDownFields = [...transferSchema.required, 'domain', 'number', 'tmpNumber', 'isPending']


function normalizeTransfer(transfer, lastTransfer) {
  if (lastTransfer) {
    _.defaults(transfer, _.pick(lastTransfer, transferCarryDownFields))
  }
  _.defaults(transfer, {
    quantity: 1,
    version: 0,
  })
  // if (!transfer.tmpNumber) {
  //   transfer.tmpNumber = shortid.generate()
  // }
  if (!transfer.tmpAt) {
    transfer.tmpAt = new Date()
  }

  // reverse from & to
  if (transfer.price < 0) {
    const to = transfer.to
    transfer.to = transfer.from
    transfer.from = to
    transfer.price = -transfer.price
  }
  return transfer
}

// global increment only number
let _lastNumber
function genTmpNumber() {
  let id = Date.now()
  if (id === _lastNumber) id ++
  _lastNumber = id
  return id
}

export function normalize(exchange) {
  const transfers = exchange.transfers
  for (let i = 0, ii = transfers.length; i < ii; i++) {
    transfers[i] = normalizeTransfer(transfers[i], transfers[i - 1])
  }

  exchange.tmpNumber = genTmpNumber()

  if (!validateExchange(exchange)) {
    console.error('SchemaError:', validateExchange.errors)
  }

  return exchange
}


// export function markArrive(deal, itemKeys) {
//   const now = new Date()
//   const arrivedAts = {}
//   _.each(itemKeys, key => {
//     arrivedAts[key] = now
//   })
//   deal.pendings = _.without(deal.pendings, itemKeys)
//   deal.arrivedAts = deal.arrivedAts ? {...deal.arrivedAts, ...arrivedAts} : arrivedAts
// }
