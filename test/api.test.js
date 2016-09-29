import _ from 'lodash'
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
  console.log('BALANC_API=', balanc.config().apiUrl)


  it('Record exchange and Receipt pdf', async () => {

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
    should(_.size(deal.transfers)).equal(2)

    // access receipt pdf
    const pdfUrl = balanc.receiptUrl(deal)
    const pdfJson = await fetch(pdfUrl).then(res => res.json())
    const pdfContent = pdfJson.content
    should(pdfContent[0]).has.properties({text: 'Receipt'})
    should(pdfContent[1]).be.startWith('To: ')
    should(pdfContent[2]).be.startWith('From: ')
    should(pdfContent[3]).be.startWith('No: ')
    should(pdfContent[4]).be.startWith('Date: ')
    // console.log(pdfContent[6].table.body)
  })


  it('Issue payment reminder', async () => {
    const deal = await balanc.createDeal({
      from: domainEmail, to: 'to-user',
      transfers: {
        'Apple': {
          price: 10,
          quantity: 1,
        },
        Cash: -10,
      },
      pendings: 'All',
    })
    deal.pendings.should.deepEqual(['Apple', 'Cash'])

    await balanc.createDeal({
      from: domainEmail, to: 'to-user2',
      transfers: {
        'Apple': {
          price: 20,
          quantity: 2,
        },
        Cash: -20,
      },
      // delivered Apple, but waiting for Cash
      pendings: ['Cash'],
    })

    const receivables = await balanc.getReceivables({
      from: domainEmail,
      // to: 'to-user',
    })
    receivables.deals.should.have.length(2)
    receivables.deals[0].receivables.should.have.deepEqual(['Cash'])
    receivables.total.should.be.equal(30)
    should(await balanc.getReceivables({
      from: domainEmail,
      to: 'to-user',
    })).has.properties({
      total: 10,
    })

    const billUrl = balanc.billUrl({from: domainEmail, to: 'to-user2'})
    const pdfJson = await fetch(billUrl).then(res => res.json())
    const pdfContent = pdfJson.content
    should(pdfContent[0]).has.properties({text: 'Bill'})
    should(pdfContent[1]).be.startWith('To: ')
    should(pdfContent[2]).be.startWith('From: ')
    should(pdfContent[5]).be.startWith('No: ')
    should(pdfContent[6]).be.startWith('Date: ')
    should(pdfContent[7].table.body[1]).deepEqual([ 'Apple  x2', '20' ])
    // console.log(pdfContent[7].table.body)
  })


  it('Access Accounts', async () => {
    const deals = await balanc.getDeals({
      from: domainEmail,
      to: 'to-user',
    })
    should(deals.length).equal(2)

    should(
      await balanc.getAccount({
        user: domainEmail,
        account: 'Cash',
      })
    ).be.properties({
      balance: 100,
    })

    const excelUrl = balanc.accountExcelUrl({
      user: domainEmail,
      account: 'Cash',
    })
    console.log(excelUrl)
  })
})
