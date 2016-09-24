// import _ from 'lodash'
import should from 'should'
import shortid from 'shortid'
import fetch from 'isomorphic-fetch'

import balanc from '../src'


describe('api', function() {
  this.timeout(10000)

  const domain = `biz-${shortid.generate()}.com`
  const domainEmail = `info@${domain}`

  balanc.config({
    domain,
    domainEmail,
  })

  // eslint-disable-next-line
  console.log('Testing API:', balanc.config().apiUrl)


  it('Record exchange and get receipt pdf', async () => {
    // record exchange
    const exchange = await balanc.exchange({
      from: domainEmail,
      to: 'user-123',
      gives: [
        {
          quantity: 2, // two months implied by item string
          item: 'Monthly Gym Membership',
          price: 100, // sub-total price of 2 monthly Gym
          // deliveredAt: new Date(),
        },
      ],
      takes: [
        {
          item: 'Cash',
          price: 100,
          // isPending: true,
        },
      ],
      // isPreview: true,
    })
    should(exchange.transfers.length).equal(2)

    // access receipt pdf
    const pdfUrl = balanc.receiptUrl(exchange)
    const pdfJson = await fetch(pdfUrl).then(res => res.json())
    const pdfContent = pdfJson.content
    should(pdfContent[0]).has.properties({text: 'Receipt'})
    should(pdfContent[1]).be.startWith('To: ')
    should(pdfContent[2]).be.startWith('From: ')
    should(pdfContent[3]).be.startWith('No: ')
    should(pdfContent[4]).be.startWith('Date: ')
    // console.log(pdfContent[6].table.body)
  })


  it('Issue Invoice', async () => {
    const receipts = await balanc.getReceipts({
      from: domainEmail,
      to: 'user-123',
    })
    should(receipts.length).equal(1)

    // const account = await balanc.getReceipts({account: 'billing@your-company.com', unit: 'USD', showTransfers: true})
    // should(account.transfers.length).be.equal(1)
    // should(account.balance).be.equal(100)
  })
})
