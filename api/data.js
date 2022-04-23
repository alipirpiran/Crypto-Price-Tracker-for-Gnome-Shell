const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;

const request = Me.imports.api.request;
let current_exchange = '';

var exchanges = {
  binance: 'Binance',
  okx: 'OKX',
};

var change_exchange = (exchange_name) => {
  current_exchange = exchange_name;
  Settings.change_exchange(exchange_name);
};

var get_exchange = () => {
  if (current_exchange != '') return current_exchange;
  current_exchange = Settings.get_exchange();
  return current_exchange;
};

var getPrice = async function (name, vol) {
  switch (get_exchange()) {
    case exchanges.binance:
      return _getPriceFromBinance(name, vol);

    case exchanges.okx:
      return _getPriceFromOKX(name, vol);
  }
};

async function _getPriceFromBinance(name, vol) {
  const url = 'https://api.binance.com/api/v3/ticker/price?symbol=';
  const res = await request.get(url + name + vol);

  const jsonRes = JSON.parse(res.body);
  if (jsonRes.code) return jsonRes.msg.slice(0, 30) + '...';

  let price = +jsonRes.price;

  let maximumFractionDigits = 0;
  const dig_count = price.toFixed().length;
  if (5 - dig_count > 0) maximumFractionDigits = 5 - dig_count;

  return price.toLocaleString(undefined, { maximumFractionDigits });
}

async function _getPriceFromOKX(name, vol) {
  const url = 'https://www.okx.com/api/v5/market/ticker?instId=';
  const res = await request.get(url + name + '-' + vol);

  const jsonRes = JSON.parse(res.body);

  if (jsonRes.data.length == 0) return -1;

  let price = +jsonRes.data[0].last;

  return price.toLocaleString();
}
