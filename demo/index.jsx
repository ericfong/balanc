import React from 'react'
import ReactDOM from 'react-dom'

import balanc from '../src'


(async () => {
  balanc.setContext({
    domain: 'your-company.com',
  })

  const pdfRes = await balanc.transfer({
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
  const pdfUrl = URL.createObjectURL(await pdfRes.blob())


  // json is ready and then getInvoice / Receive of from and to
  // const pdfUrl = balanc.getBalance({account: 'user-123', unit: 'USD', $out: 'url'})
  // const receivePdfUrl = balanc.getReceive({
  //   from: 'billing@your-company.com',
  //   to: 'user-123',
  //   unit: 'USD',
  // })

  ReactDOM.render((
    <div>
      <iframe
        src={pdfUrl}
        seamless
        width="100%"
        height="700px"
        />
    </div>
  ), document.getElementById('app'))
})()
