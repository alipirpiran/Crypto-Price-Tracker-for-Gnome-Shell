const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;

const request = Me.imports.api.request;
let current_exchange = '';

var exchanges = {
  binance: 'Binance',
  okx: 'OKX',
  coingecko: 'Coingecko',
};

var change_exchange = (exchange_name) => {
  current_exchange = exchange_name;
  Settings.change_exchange(exchange_name);
};

var get_exchange = () => {
  if (current_exchange !== '') return current_exchange;
  current_exchange = Settings.get_exchange();
  return current_exchange;
};

var getPrice = async function (name, vol, exchange) {
  switch (exchange) {
    case exchanges.binance:
      return _getPriceFromBinance(name, vol);

    case exchanges.okx:
      return _getPriceFromOKX(name, vol);

    case exchanges.coingecko:
      return _getPriceFromCoingecko(name, vol);
  }
};

async function _getPriceFromBinance(name, vol) {
  try {
    const url = 'https://api.binance.com/api/v3/ticker/price?symbol=';
    const res = await request.get(url + name + vol);

    const jsonRes = JSON.parse(res.body);
    if (jsonRes.code) return jsonRes.msg.slice(0, 30) + '...';

    let price = +jsonRes.price;

    let { maximumFractionDigits, minimumFractionDigits } =
      _fractionDigits(price);
    return price.toLocaleString(undefined, {
      maximumFractionDigits,
      minimumFractionDigits,
    });
  } catch (error) {}
}

async function _getPriceFromOKX(name, vol) {
  try {
    const url = 'https://www.okx.com/api/v5/market/ticker?instId=';
    const res = await request.get(url + name + '-' + vol);

    const jsonRes = JSON.parse(res.body);

    if (jsonRes.data.length === 0) return -1;

    let price = +jsonRes.data[0].last;

    let { maximumFractionDigits, minimumFractionDigits } =
      _fractionDigits(price);
    return price.toLocaleString(undefined, {
      maximumFractionDigits,
      minimumFractionDigits,
    });
  } catch (error) {}
}

async function _getPriceFromCoingecko(name, vol) {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=${vol}`;
    const res = await request.get(url);

    name = name.toLowerCase();
    vol = vol.toLowerCase();
    const jsonRes = JSON.parse(res.body);

    if (Object.keys(jsonRes).length === 0) return 'Not found';
    if (Object.keys(jsonRes[name]).length === 0) return 'Not found';

    let price = +jsonRes[name][vol];

    let { maximumFractionDigits, minimumFractionDigits } =
      _fractionDigits(price);
    return price.toLocaleString(undefined, {
      maximumFractionDigits,
      minimumFractionDigits,
    });
  } catch (error) {}
}

function _fractionDigits(price) {
  let maximumFractionDigits = 0;
  let minimumFractionDigits = 0;

  if (price < 1000 && price >= 10) {
    maximumFractionDigits = 2;
    minimumFractionDigits = 2;
  } else if (price < 10 && price >= 1) {
    maximumFractionDigits = 3;
    minimumFractionDigits = 3;
  } else if (price < 1 && price >= 0.1) {
    maximumFractionDigits = 4;
    minimumFractionDigits = 4;
  } else if (price < 0.1) {
    maximumFractionDigits = 5;
    minimumFractionDigits = 5;
  }

  return { maximumFractionDigits, minimumFractionDigits };
}
