const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const convenience = Me.imports.convenience;
const Schema = convenience.getSettings(
    'org.gnome.shell.extensions.crypto-tracker'
);

var getCoins = function () {
    let coinJsonStr = String(Schema.get_string('coins'));
    let coinJson = JSON.parse(coinJsonStr);
    return coinJson.coins;
};

var addCoin = function ({ symbol, active, title }) {
    let coin = {
        symbol: symbol.toUpperCase(),
        active,
        title
    };
    if (_checkIsDuplicate(coin)) return false;
    let originalCoinsStr = Schema.get_string('coins');
    let originalCoinObj = JSON.parse(originalCoinsStr);
    originalCoinObj.coins.push(coin);

    Schema.set_string('coins', JSON.stringify(originalCoinObj));
    return true;
};

function _checkIsDuplicate(coin) {
    let coins = getCoins();
    for (const _coin of coins) if (coin.symbol.toUpperCase() == _coin.symbol) return true;

    return false;
}

var delCoin = function ({ symbol }) {
    let coinJsonStr = String(Schema.get_string('coins'));
    let coinJson = JSON.parse(coinJsonStr);
    let coins = coinJson.coins;

    let index = coins.findIndex((value) => {
        return value.symbol == symbol;
    });
    if (index) coins.splice(index, 1);

    Schema.set_string('coins', JSON.stringify(coinJson));
};

var updateCoin = function(coin){
    const coins = getCoins()
    for(const _coin of coins){
        if(_coin.symbol == coin.symbol){
            _coin.active = coin.active;
            _coin.title = coin.title
            _coin.symbol = coin.symbol
        }
    }
    setCoins(coins)
}
/**
 * @param  {[{}]} coins
 */
var setCoins = function (coins) {
    let originalCoinsStr = Schema.get_string('coins');
    let originalCoinObj = JSON.parse(originalCoinsStr);
    originalCoinObj.coins = coins;
    Schema.set_string('coins', JSON.stringify(originalCoinObj));
}
