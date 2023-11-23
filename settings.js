import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';


function _getSettings() {
  let extensionObject = Extension.lookupByUUID('crypto@alipirpiran.github');

  return extensionObject.getSettings();
}

export let getCoins = function () {
  const settings = _getSettings();

  let coinJsonStr = String(settings.get_string('coins'));
  let coinJson = JSON.parse(coinJsonStr);
  return coinJson.coins;
};

export let addCoin = function ({
  id,
  symbol,
  active,
  title,
  exchange,
  coingecko_id,
}) {
  const settings = _getSettings();

  let coin = {
    id,
    symbol: symbol.toUpperCase(),
    active,
    title,
    exchange,
    coingecko_id,
  };
  if (_checkIsDuplicate(coin)) return false;
  let originalCoinsStr = settings.get_string('coins');
  let originalCoinObj = JSON.parse(originalCoinsStr);
  originalCoinObj.coins.push(coin);

  settings.set_string('coins', JSON.stringify(originalCoinObj));
  return true;
};

function _checkIsDuplicate(coin) {
  let coins = getCoins();
  for (const _coin of coins)
    if (
      coin.symbol.toUpperCase() === _coin.symbol &&
      coin.exchange === _coin.exchange
    )
      return true;

  return false;
}

export let delCoin = function ({ id }) {
  const settings = _getSettings();

  let coinJsonStr = String(settings.get_string('coins'));
  let coinJson = JSON.parse(coinJsonStr);
  let coins = coinJson.coins;

  let index = coins.findIndex((value) => {
    return value.id === id;
  });
  if (index !== -1) coins.splice(index, 1);

  settings.set_string('coins', JSON.stringify(coinJson));
};

export let setCoinId = function (coin) {
  const coins = getCoins();

  for (const _coin of coins) {
    if (_coin.symbol === coin.symbol) {
      _coin.id = coin.id;
    }
  }

  setCoins(coins);
};

export let updateCoin = function (coin) {
  const coins = getCoins();

  for (const _coin of coins) {
    if (_coin.id === coin.id) {
      _coin.active = coin.active;
      _coin.title = coin.title;
      _coin.symbol = coin.symbol;
      _coin.exchange = coin.exchange;
    }
  }

  setCoins(coins);
};

/**
 * @param  {[{}]} coins
 */
export let setCoins = function (coins) {
  const settings = _getSettings();

  let originalCoinsStr = settings.get_string('coins');
  let originalCoinObj = JSON.parse(originalCoinsStr);
  originalCoinObj.coins = coins;
  settings.set_string('coins', JSON.stringify(originalCoinObj));
};

export let get_exchange = () => {
  const settings = _getSettings();
  return settings.get_string('exchange');
};

export let change_exchange = (ex) => {
  const settings = _getSettings();
  return settings.set_string('exchange', ex);
};
