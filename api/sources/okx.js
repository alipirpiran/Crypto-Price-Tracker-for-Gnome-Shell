import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';
const Me = ExtensionUtils.getCurrentExtension();
import request from './api/request.js';

var OkxClient = {
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
    exchangeUrl = 'https://www.okx.com/markets/spot-info';
    formattedPair = symbol.replace('/', '-').toLowerCase();

    return _('%s/%s').format(exchangeUrl, formattedPair);
  }
}
