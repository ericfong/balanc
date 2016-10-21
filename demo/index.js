import shortid from 'shortid'

import balanc from '../src'


(async () => {

  const domain = `biz-${shortid.generate()}.com`
  const domainEmail = `info@${domain}`

  balanc.config({
    domain,
    domainEmail,
  })

  // create deal
  const deal = await balanc.createDeal({
    from: domainEmail,
    to: 'to-user',
    transfers: {
      'Monthly Gym Membership': {
        price: 100, // sub-total price of 2 monthly Gym
        quantity: 2, // two months implied by item string
      },
      Cash: -100, // negative 100 means, source user get back $100
    },
  })

  // open receipt for that deal in new window
  balanc.openWindow(balanc.receiptUrl(deal))

})()
