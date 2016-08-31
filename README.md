balanc
======
Scalable and ACID system to offload transfers and accounting storage from your system

<b>State: development. Using service from http://eddyy.com</b>


Why use?
--------
if you are using NoSQL, balanc can replace traditional lock and transaction required operations for orders, invoices, receives and payments

if you are using SQL, balanc can solve the scale and storage problem


API
---
```
import balanc from 'balanc'

async () => {

  // default values for following calls
  balanc.setContext({
    domain: 'your-company.com',
    domainEmail: 'billing@your-company.com',
  })


  // user-123 deposit $10 into his/her account
  await balanc.transfer({
    from: 'CASH_DEPOSIT',
    to: 'user-123',
    amount: 10,
  })

  // transfer $10 from user-123 to your-company
  await balanc.transfer({
    from: 'user-123',
    to: 'your-company',
    amount: 10,
    text: 'Book ABC',
  })

  // get account balance
  const account = await balanc.getAccount({account: 'user-123'})
  should(account.balance).be.equal(0)

  // get all transfers for user-123
  const transfers = await balanc.getTransfers({account: 'user-123'})
  should(transfers.length).be.equal(2)

}
```


How?
----
- Record transfer as log and use job queue to resolve the transaction and locking problem
- Create balance record monthly and daily for fast read


Inspired by
-----------
- https://dzone.com/articles/how-implement-robust-and
