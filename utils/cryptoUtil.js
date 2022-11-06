const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;
const Data = Me.imports.api.data;

var getChartUrl = (symbol, exchange) => {
  let exchangeUrl, formattedPair;

  if (Data.exchanges.okx === exchange) {
    exchangeUrl = 'https://www.okx.com/markets/spot-info';
    formattedPair = symbol.replace('/', '-').toLowerCase();
  } else {
    exchangeUrl = 'https://www.binance.com/en/trade';
    formattedPair = symbol.replace('/', '_').toUpperCase();
  }

  return _("%s/%s").format(exchangeUrl, formattedPair);
}

var createUUID = () => {
  let dt = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};