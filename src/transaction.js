import _ from 'lodash'


export function normalize(deal) {
  if (!deal.createdAt) {
    deal.createdAt = new Date()
  }

  // normalize transfer
  _.each(deal.transfers, (transfer, key) => {
    if (typeof transfer === 'number') {
      transfer = deal.transfers[key] = {price: transfer}
    }
  })

  if (deal.pendings === 'All') {
    deal.pendings = _.keys(deal.transfers)
  } else if (_.isEmpty(deal.pendings)) {
    delete deal.pendings
  }

  return deal
}


export function markArrive(deal, itemKeys) {
  const now = new Date()
  const arrivedAts = {}
  _.each(itemKeys, key => {
    arrivedAts[key] = now
  })
  deal.pendings = _.without(deal.pendings, itemKeys)
  deal.arrivedAts = deal.arrivedAts ? {...deal.arrivedAts, ...arrivedAts} : arrivedAts
}
