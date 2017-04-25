const axios = require('axios')
const BN = require('../../../bn')

function ticker (account, fiatCode, cryptoCode) {
  if (cryptoCode !== 'BTC') {
    return Promise.reject('Unsupported crypto: ' + cryptoCode)
  }

  return axios.get('https://bitpay.com/api/rates/' + fiatCode)
  .then(r => {
    const data = r.data
    const price = BN(data.rate)
    return {
      rates: {
        ask: price,
        bid: price
      }
    }
  })
}

module.exports = {
  ticker,
  name: 'BitPay'
}