import _ from 'lodash'


export default function renderReceipt({from, to, number, createdAt, transfers}, {locale = 'en'}) {
  const orderLines = []
  _.each(transfers, (tran, item) => {
    if (tran.price >= 0) {
      orderLines.push([
        `${item} ${tran.description || ''} ${tran.quantity ? `x${tran.quantity}` : ''}`,
        `${tran.price || 0}`,
      ])
    }
  })

  const total = _.sumBy(_.filter(transfers, tran => tran.price >= 0), 'price')

  const pdfView = {
    content: [
      { text: 'Receipt', style: 'h1' },
      `To: ${to}`,
      `From: ${from}`,
      `No: ${number}`,
      `Date: ${new Date(createdAt).toLocaleDateString(locale)}`,
      '',
      {
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          widths: [ '*', 'auto' ],
          body: [
            [ { text: 'Item', bold: true }, { text: 'Amount', bold: true } ],
            ...orderLines,
            [ { text: 'Total', alignment: 'right' }, { text: `${total}`, bold: true } ],
          ],
        },
      },
    ],
    styles: {
      h1: {
        fontSize: 22,
        bold: true,
      },
    },
  }

  return pdfView
}
