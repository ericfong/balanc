balanc
======

Managed Cloud DB for Sale, Inventory and Billings

which can offload transactions, receipt PDFs from your system

**State: Development. Using service from http://eddyy.com**


Why use?
--------
if you are using NoSQL, balanc can replace traditional lock and transaction required operations for orders, invoices, receives and payments

if you are using SQL, balanc can solve the scale and storage problem


**[Demo](https://ericfong.github.io/balanc/demo/index.html)**


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


How?
----
- Record transfer as log and use job queue to resolve the transaction and locking problem
- Create balance record monthly and daily for fast read


Inspired by
-----------
- https://dzone.com/articles/how-implement-robust-and
