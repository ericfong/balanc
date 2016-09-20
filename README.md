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



API
---
```js
import balanc from 'balanc'


balanc.setContext({
  domain: 'your-company.com',
})

const response = await balanc.transact({
  from: 'billing@your-company.com',
  to: 'user-123',
  gives: [
    {
      quantity: 2, // two months implied by item string
      item: 'Monthly Gym Membership',
      price: 100,
    },
  ],
  takes: [
    {
      item: 'Cash',
      price: 100,
    },
  ],
  $out: 'receipt_pdf',
})
const receiptPdfBlob = response.blob()

```



How
---
- Based on http://eddyy.com
- Record transfer as log and use job queue to resolve the transaction and locking problem
- Create balance record monthly and daily for fast read



Inspired by
-----------
- https://dzone.com/articles/how-implement-robust-and
