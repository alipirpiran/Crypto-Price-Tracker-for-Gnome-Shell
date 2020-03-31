const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const convenience = Me.imports.convenience;
const Schema = convenience.getSettings(
    'org.gnome.shell.extensions.crypto-tracker'
);

var getCoins = function() {
    let coinJsonStr = String(Schema.get_string('coins'));
    let coinJson = JSON.parse(coinJsonStr);
    return coinJson.coins;
};

var addCoin = function({ name, symbol, active }) {
    let coin = {
        name,
        symbol,
        active,
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
    for (const _coin of coins) if (coin.name == _coin.name) return true;

    return false;
}

var delCoin = function({ name }) {
    let coinJsonStr = String(Schema.get_string('coins'));
    let coinJson = JSON.parse(coinJsonStr);
    let coins = coinJson.coins;

    let index = coins.findIndex(value => {
        return value.name == name;
    });
    if (index) coins.splice(index, 1);

    Schema.set_string('coins', JSON.stringify(coinJson));
};
