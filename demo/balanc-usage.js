import shortid from 'shortid'

import balanc from '../src'


const domain = `biz-${shortid.generate()}.com`
const domainEmail = `info@${domain}`


export function init() {
  balanc.config({
    domain,
    domainEmail,
  })
}


export function openDealReceipt() {
  // open a new window first to prevent pop-up blocking
  balanc.openWindow({target: 'receiptWin'}, () => {
    // create deal
    return balanc.createDeal({
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
    // then, get receipt url
    .then(deal => balanc.receiptUrl(deal))
  })
}
