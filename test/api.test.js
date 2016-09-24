// import _ from 'lodash'
import should from 'should'
import shortid from 'shortid'

import balanc from '../src'


describe('api', function() {
  this.timeout(10000)

  const domain = `biz-${shortid.generate()}.com`
  const domainEmail = `info@${domain}`

  balanc.setContext({
    domain,
    domainEmail,
  })

  it('basic', async () => {

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

    const pdf = await balanc.printReceipt(exchange)

    // const pdfConfig = await balanc.transfer({
    //   from: 'billing@your-company.com',
    //   to: 'user-123',
    //   gives: [
    //     {
    //       quantity: 2, // two months implied by item string
    //       item: 'Monthly Gym Membership',
    //       price: 100,
    //     },
    //   ],
    //   takes: [
    //     {
    //       item: 'Cash',
    //       price: 100,
    //     },
    //   ],
    //   $out: 'receipt_pdf',
    // })
    // const pdfContent = pdfConfig.content
    // should(pdfContent[0]).has.properties({text: 'Receipt'})
    // should(pdfContent[1]).be.startWith('To: ')
    // should(pdfContent[2]).be.startWith('From: ')
    // should(pdfContent[3]).be.startWith('No: ')
    // should(pdfContent[4]).be.startWith('Date: ')
    // console.log(pdfContent[6].table.body)

    // get account balance
    // const account = await balanc.getBalance({account: 'billing@your-company.com', unit: 'USD', showTransfers: true})
    // should(account.transfers.length).be.equal(1)
    // should(account.balance).be.equal(100)
  })
})
