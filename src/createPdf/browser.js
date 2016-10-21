/* global pdfMake */

// use webpack to embed pdfmake
/* eslint-disable */
require('script!../../bower_components/pdfmake/build/pdfmake.js')
require('script!../../bower_components/pdfmake/build/vfs_fonts.js')
/* eslint-enable */


export default function createPdf(docDefinition) {
  const pdf = pdfMake.createPdf(docDefinition)

  Object.assign(pdf, {
    getBlob(option) {
      return new Promise(resolve => {
        this.getBuffer(function(result) {
          let blob
          try {
            blob = new Blob([result], { type: 'application/pdf' })
          } catch (e) {
            // Old browser which can't handle it without making it an byte array (ie10)
            if (e.name == 'InvalidStateError') {
              var byteArray = new Uint8Array(result)
              blob = new Blob([byteArray.buffer], { type: 'application/pdf' })
            }
          }
          if (!blob) {
            throw new Error('Could not generate blob')
          }
          resolve(blob)
        }, option)
      })
    },

    getUrl(option) {
      return this.getBlob(option)
      .then(blob => (window.URL || window.webkitURL).createObjectURL(blob))
    },
  })

  return pdf
}
