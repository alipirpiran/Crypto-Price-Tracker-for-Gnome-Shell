import * as Settings from '../settings.js';

import { BinanceClient } from './sources/binance.js';
import { CoingeckoClient } from './sources/coingecko.js';
import { CryptoClient } from './sources/crypto.js';
import { OkxClient } from './sources/okx.js';

export let current_exchange = '';

export var exchanges = {
  binance: 'Binance',
  coingecko: 'Coingecko',
  crypto: 'Crypto',
  okx: 'OKX'
};

export var change_exchange = (exchange_name) => {
  current_exchange = exchange_name;
  Settings.change_exchange(exchange_name);
};

export let get_exchange = () => {
  if (current_exchange !== '') return current_exchange;
  current_exchange = Settings.get_exchange();
  return current_exchange;
};

export let getPrice = async function (name, vol, exchange) {
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

export let getChartUrl = (symbol, exchange) => {
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
