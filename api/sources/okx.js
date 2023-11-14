import * as request from '../request.js';

export var OkxClient = {
  async _getPrice(name, vol) {
    try {
      const url = 'https://www.okx.com/api/v5/market/ticker?instId=';
      const res = await request.get(url + name + '-' + vol);

      const jsonRes = JSON.parse(res.body);

      if (jsonRes.data.length > 0)

      return +jsonRes.data[0].last;
    } catch (error) {
      console.debug(error);
    }
  },

  _getChartUrl(symbol) {
    let exchangeUrl = 'https://www.okx.com/markets/spot-info';
    let formattedPair = symbol.replace('/', '-').toLowerCase();

    return _('%s/%s').format(exchangeUrl, formattedPair);
  }
}
