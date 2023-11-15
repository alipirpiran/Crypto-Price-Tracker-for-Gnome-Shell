import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
const Me = Extension.lookupByUUID('crypto@alipirpiran.github');
import {get} from '../request.js';

export var BinanceClient = {
  async _getPrice(name, vol) {
    try {
      const url = 'https://api.binance.com/api/v3/ticker/price?symbol=';
      const res = await get(url + name + vol);

      const jsonRes = JSON.parse(res.body);
      if (jsonRes.code) return jsonRes.msg.slice(0, 30) + '...';

      return +jsonRes.price;
    } catch (error) {
      console.debug(error);
    }
  },

  _getChartUrl(symbol) {
    let exchangeUrl = 'https://www.binance.com/en/trade';
    let formattedPair = symbol.replace('/', '_').toUpperCase();

    return _('%s/%s').format(exchangeUrl, formattedPair);
  }
}
