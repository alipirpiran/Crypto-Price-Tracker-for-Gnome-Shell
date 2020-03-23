const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const request = Me.imports.api.request;

var getBTC = function() {
    return request.get(
        'https://www.binance.com/api/v3/avgPrice?symbol=BTCUSDT'
    );
};
