balanc
======

Modern accounting (receipts, billings, pdf storage ...) toolchain and managed service. Making accounting easy and always balance.


[![npm](https://img.shields.io/npm/dt/balanc.svg?maxAge=2592000?style=flat-square)]()
[![npm](https://img.shields.io/npm/v/balanc.svg)]()
[![state](https://img.shields.io/badge/state-development-orange.svg)]()
[![npm](https://img.shields.io/npm/l/balanc.svg)]()

[![NPM](https://nodei.co/npm-dl/balanc.png?months=1)](https://nodei.co/npm/balanc/)



Why
---
- if you are using NoSQL, balanc can replace traditional lock and transaction required operations for orders, invoices, receives and payments
- if you are using SQL, balanc can solve the scale and storage problem



Demo
----
[Basic Receipt Pdf Demo](https://ericfong.github.io/balanc/demo/index.html)

<form action="https://eddyy.com/demo">
  <input type="submit" value="Try out Demo">
</form>


API
---

##### Setup config
```js
balanc.config({
  domain: 'your-company.com',
})
```


##### Record exchange and Receipt pdf
```js
const exchange = await balanc.exchange({
  from: 'billing@your-company.com',
  to: 'user-123',
  gives: [
    {
      quantity: 2, // two months implied by item string
      item: 'Monthly Gym Membership',
      price: 100, // sub-total price of 2 monthly Gym
      // givenAt: new Date(),
    },
  ],
  takes: [
    {
      item: 'Cash',
      price: 100,
    },
  ],
  // isPreview: true,
})

const pdfUrl = await balanc.receiptUrl(exchange)

```


#### Issue payment reminder
```js
const receivables = await balanc.getReceivables({
  from: 'billing@your-company.com',
  to: 'user-123',
})

const invoiceUrl = await balanc.billingUrl({
  from: 'billing@your-company.com',
  to: 'user-123',
})
// [{url, paidAt}]

```


#### Access Accounts
```js
const numbers = await balanc.getExchangeNumbers({
  from: 'billing@your-company.com',
  to: 'user-123',
})

const balance = await balanc.getBalance({
  user: 'billing@your-company.com',
  item: 'Cash',
})
should(balance).be.equal(100)

const account = await balanc.getAccount({
  user: 'billing@your-company.com',
  item: 'Cash',
})
should(account.balance).be.equal(100)
should(account.transfers.length).be.equal(1)

const excelUrl = balanc.accountExcelUrl({
  user: 'billing@your-company.com',
  item: 'Cash',
})
// url that access xlsx file
```


How
---
- Based on http://eddyy.com
- Record transfer as log and use job queue to resolve the transaction and locking problem
- Create balance record monthly and daily for fast read
- Inspired by https://dzone.com/articles/how-implement-robust-and
