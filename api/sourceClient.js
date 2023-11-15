import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
const Me = Extension.lookupByUUID('crypto@alipirpiran.github');
import Settings from './settings.js';

import { BinanceClient } from './api/sources/binance.js';
import { CoingeckoClient } from './api/sources/coingecko.js';
import { CryptoClient } from './api/sources/crypto.js';
import { OkxClient } from './api/sources/okx.js';

let current_exchange = '';

var exchanges = {
  binance: 'Binance',
  coingecko: 'Coingecko',
  crypto: 'Crypto',
  okx: 'OKX'
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
  let price;

  switch (exchange) {
    case exchanges.binance:
      price = await BinanceClient._getPrice(name, vol);
      break;
    case exchanges.coingecko:
      price = await CoingeckoClient._getPrice(name, vol);
      break;
    case exchanges.crypto:
      price = await CryptoClient._getPrice(name, vol);
      break;
    case exchanges.okx:
      price = await OkxClient._getPrice(name, vol);
      break;
  }

  let { maximumFractionDigits, minimumFractionDigits } =
    _fractionDigits(price);

  return price.toLocaleString(undefined, {
    maximumFractionDigits,
    minimumFractionDigits,
  });
};

var getChartUrl = (symbol, exchange) => {
  switch (exchange) {

    case exchanges.binance:
      return BinanceClient._getChartUrl(symbol);

    case exchanges.coingecko:
      return CoingeckoClient._getChartUrl(symbol);

    case exchanges.crypto:
      return CryptoClient._getChartUrl(symbol);

    case exchanges.okx:
      return OkxClient._getChartUrl(symbol);

    default:
      return null;
  }

};

function _fractionDigits(price) {
  let maximumFractionDigits = 0;
  let minimumFractionDigits = 0;

  if (price < 1000 && price >= 100) {
    maximumFractionDigits = 1;
    minimumFractionDigits = 1;
  } else if (price < 100 && price >= 10) {
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
