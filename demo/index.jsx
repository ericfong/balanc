import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import RaisedButton from 'material-ui/RaisedButton'

import balanc from '../src'


async function run() {
  balanc.setContext({domainEmail: 'billing@your-company.com'})

  await balanc.transfer({
    from: 'user-123',
    to: 'billing@your-company.com',
    unit: 'HKD',
    amount: 100,
    gains: [
      {
        unit: 'Monthly Gym Membership',
        amount: 2, // two months
      },
    ],
  })

  const pdfRes = await balanc.getInvoice({account: 'user-123'})
  const pdfUrl = URL.createObjectURL(await pdfRes.blob())
  return pdfUrl
}


class App extends Component {
  state = {}
  render() {
    const {pdfUrl} = this.state
    return (
      <div style={{ margin: '16px auto', maxWidth: 700 }}>
        <RaisedButton
          label="Run"
          onTouchTap={async () => {
            this.setState({ pdfUrl: await run() })
          }}
          primary
          fullWidth
          />

        <iframe
          src={pdfUrl}
          seamless
          width="100%"
          />
      </div>
    )
  }
}




(async () => {
  injectTapEventPlugin()
  ReactDOM.render((
    <MuiThemeProvider muiTheme={getMuiTheme()}>
      <App />
    </MuiThemeProvider>
  ), document.getElementById('app'))
})()
