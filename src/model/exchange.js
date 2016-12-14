import _ from 'lodash'
import genTmpNumber from '../genTmpNumber'

import {validateExchange} from './validators'
import {transferSchema} from './schemas'

const transferCarryDownFields = [...transferSchema.required, 'domain', 'number', 'tmpNumber', 'isPending']


export function normalizeTransfer(transfer, lastTransfer) {
  if (lastTransfer) {
    _.defaults(transfer, _.pick(lastTransfer, transferCarryDownFields))
  }
  _.defaults(transfer, {
    quantity: 1,
    version: 0,
  })

  // reverse from & to
  if (transfer.price < 0) {
    const to = transfer.to
    transfer.to = transfer.from
    transfer.from = to
    transfer.price = -transfer.price
  }
  return transfer
}

export function normalize(exchange) {
  const transfers = exchange.transfers
  for (let i = 0, ii = transfers.length; i < ii; i++) {
    transfers[i] = normalizeTransfer(transfers[i], transfers[i - 1])
  }

  if (!exchange._id) {
    const tmpNumber = genTmpNumber()
    exchange._id = `tmp-${tmpNumber}`
  }

  if (!exchange.tmpAt) {
    exchange.tmpAt = new Date()
  }

  if (!validateExchange(exchange)) {
    console.error('SchemaError:', validateExchange.errors)
  }

  return exchange
}
