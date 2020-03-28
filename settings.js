let getCoins = function(schema) {
    let coinJsonStr = String(schema.get_string('coins'));
    let coinJson = JSON.parse(coinJsonStr);
    return coinJson.coins;
};

let addCoin = function(schema, { name, symbol, active }) {
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
