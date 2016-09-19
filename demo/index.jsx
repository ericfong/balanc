import React from 'react'
import ReactDOM from 'react-dom'

import balanc from '../src'


(async () => {

  // EXTRACT TO README.md
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
  // END OF EXTRACT TO README.md

  const receiptUrl = URL.createObjectURL(await receiptPdfBlob)

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
