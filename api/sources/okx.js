const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const request = Me.imports.api.request;

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
