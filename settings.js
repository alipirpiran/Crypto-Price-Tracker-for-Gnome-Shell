var getCoins = function(schema) {
    let coinJsonStr = String(schema.get_string('coins'));
    let coinJson = JSON.parse(coinJsonStr);
    return coinJson.coins;
};

var addCoin = function(schema, { name, symbol, active }) {
    let coin = {
        name,
        symbol,
        active,
    };
    let originalCoinsStr = schema.get_string('coins');
    let originalCoinObj = JSON.parse(originalCoinsStr);
    originalCoinObj.coins.push(coin);

    schema.set_string('coins', JSON.stringify(originalCoinObj));
};

var delCoin = function(schema, { name }) {
    let coinJsonStr = String(schema.get_string('coins'));
    let coinJson = JSON.parse(coinJsonStr);
    let coins = coinJson.coins;

    let index = coins.findIndex(value => {
        return value.name == name;
    });
    if (index) coins.splice(index, 1);

    schema.set_string('coins', JSON.stringify(coinJson));
};
