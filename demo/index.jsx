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

  const pdfUrl = await balanc.getInvoice({account: 'user-123', output: 'pdf_url'})
  console.log(pdfUrl)
}


class App extends Component {
  render() {
    return (
      <div style={{ margin: '16px auto', maxWidth: 700 }}>
        <RaisedButton
          label="Run"
          onTouchTap={run}
          primary
          fullWidth
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
