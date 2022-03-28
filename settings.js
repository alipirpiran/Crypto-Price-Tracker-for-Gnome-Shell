const ExtensionUtils = imports.misc.extensionUtils;

let _settings;
function _getSettings() {
  if (!_settings) _settings = ExtensionUtils.getSettings();
  return _settings;
}

var getCoins = function () {
  const settings = _getSettings();

  let coinJsonStr = String(settings.get_string('coins'));
  let coinJson = JSON.parse(coinJsonStr);
  return coinJson.coins;
};

var addCoin = function ({ symbol, active, title }) {
  const settings = _getSettings();

  let coin = {
    symbol: symbol.toUpperCase(),
    active,
    title,
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
    if (coin.symbol.toUpperCase() == _coin.symbol) return true;

  return false;
}

var delCoin = function ({ symbol }) {
  const settings = _getSettings();

  let coinJsonStr = String(settings.get_string('coins'));
  let coinJson = JSON.parse(coinJsonStr);
  let coins = coinJson.coins;

  let index = coins.findIndex((value) => {
    return value.symbol == symbol;
  });
  if (index != -1) coins.splice(index, 1);

  settings.set_string('coins', JSON.stringify(coinJson));
};

var updateCoin = function (coin) {
  const coins = getCoins();
  for (const _coin of coins) {
    if (_coin.symbol == coin.symbol) {
      _coin.active = coin.active;
      _coin.title = coin.title;
      _coin.symbol = coin.symbol;
    }
  }
  setCoins(coins);
};

/**
 * @param  {[{}]} coins
 */
var setCoins = function (coins) {
  const settings = _getSettings();

  let originalCoinsStr = settings.get_string('coins');
  let originalCoinObj = JSON.parse(originalCoinsStr);
  originalCoinObj.coins = coins;
  settings.set_string('coins', JSON.stringify(originalCoinObj));
};

var get_exchange = () => {
  const settings = _getSettings();
  return settings.get_string('exchange');
};

var change_exchange = (ex) => {
  const settings = _getSettings();
  return settings.set_string('exchange', ex);
};
