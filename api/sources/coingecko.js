const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
import request from './api/request.js';

var CoingeckoClient = {
  async _getPrice(name, vol) {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=${vol}`;
      const res = await request.get(url);

      name = name.toLowerCase();
      vol = vol.toLowerCase();
      const jsonRes = JSON.parse(res.body);

      if (Object.keys(jsonRes).length === 0) return 'Not found';
      if (Object.keys(jsonRes[name]).length === 0) return 'Not found';

      return +jsonRes[name][vol];
    } catch (error) {
      console.debug(error);
    }
  },

  _getChartUrl(symbol) {
    exchangeUrl = 'https://www.coingecko.com/en/coins';
    formattedPair = symbol.toLowerCase();

    return _('%s/%s').format(exchangeUrl, formattedPair);
  }
}
