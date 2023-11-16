import {get} from '../request.js';

export var OkxClient = {
  async _getPrice(name, vol) {
    try {
      const url = 'https://www.okx.com/api/v5/market/ticker?instId=';
      const res = await get(url + name + '-' + vol);

      const jsonRes = JSON.parse(res.body);

      if (jsonRes.data.length > 0)

      return +jsonRes.data[0].last;
    } catch (error) {
      console.debug(error);
    }
  },

  _getChartUrl(symbol) {
    exchangeUrl = 'https://www.okx.com/markets/spot-info';
    formattedPair = symbol.replace('/', '-').toLowerCase();

    return _('%s/%s').format(exchangeUrl, formattedPair);
  }
}
