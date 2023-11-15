import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';
const Me = ExtensionUtils.getCurrentExtension();
import request from './api/request.js';

var CryptoClient = {
  async _getPrice(name, vol) {
    try {
      const url = 'https://api.crypto.com/v2/public/get-ticker?instrument_name=';
      const res = await request.get(url + name + '_' + vol);

      const jsonRes = JSON.parse(res.body);
      if (jsonRes.result?.data.length === 0) return -1;

      return +jsonRes.result.data[0].a;
    } catch (error) {
      console.debug( error);
    }
  },

  _getChartUrl(symbol) {
    exchangeUrl = 'https://crypto.com/exchange/trade';
    formattedPair = symbol.replace('/', '_').toUpperCase();

    return _('%s/%s').format(exchangeUrl, formattedPair);
  }
}
