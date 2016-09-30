import shortid from 'shortid'
import React from 'react'
import ReactDOM from 'react-dom'

import balanc from '../src'


(async () => {

  const domain = `biz-${shortid.generate()}.com`
  const domainEmail = `info@${domain}`

  // EXTRACT TO README.md
  balanc.config({
    domain,
    domainEmail,
  })

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
  const receiptUrl = balanc.receiptUrl(deal)
  // END OF EXTRACT TO README.md

  ReactDOM.render((
    <div>
      <iframe
        src={receiptUrl}
        seamless
        width="100%"
        height="700px"
        />
    </div>
  ), document.getElementById('app'))
})()
