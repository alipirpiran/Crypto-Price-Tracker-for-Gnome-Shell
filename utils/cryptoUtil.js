const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;
const Data = Me.imports.api.data;

const { GLib, Gio } = imports.gi;
const Config = imports.misc.config;

var coingecko_data = null;

var getChartUrl = (symbol, exchange) => {
  let exchangeUrl, formattedPair;

  switch (exchange) {
    case Data.exchanges.okx:
      exchangeUrl = 'https://www.okx.com/markets/spot-info';
      formattedPair = symbol.replace('/', '-').toLowerCase();

      break;

    case Data.exchanges.binance:
      exchangeUrl = 'https://www.binance.com/en/trade';
      formattedPair = symbol.replace('/', '_').toUpperCase();
      break;

    case Data.exchanges.coingecko:
      break;

    default:
      break;
  }

  return _('%s/%s').format(exchangeUrl, formattedPair);
};

var createUUID = () => {
  let dt = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

var _get_coingecko_data = async () => {
  if (coingecko_data) return coingecko_data;

  //TODO update json file, if one coin not found. get from https://api.coingecko.com/api/v3/coins/list
  const file = Gio.File.new_for_path(
    '.local/share/gnome-shell/extensions/crypto@alipirpiran.github/assets/coingecko.json'
  );
  const [, contents, etag] = await new Promise((resolve, reject) => {
    file.load_contents_async(null, (file_, result) => {
      try {
        resolve(file.load_contents_finish(result));
      } catch (e) {
        reject(e);
      }
    });
  });

  var contentsString = '';
  if (+Config.PACKAGE_VERSION >= 41) {
    const decoder = new TextDecoder('utf-8');
    contentsString = decoder.decode(contents);
  } else {
    const ByteArray = imports.byteArray;
    contentsString = ByteArray.toString(contents);
  }

  coingecko_data = JSON.parse(contentsString);
  return coingecko_data;
};

var coingecko_symbol_to_id = async (symbol) => {
  try {
    const data = await _get_coingecko_data();
    for (const item of data) {
      if (item['symbol'].toLowerCase() === symbol.toLowerCase())
        return item['id'];
    }
  } catch (error) {
    console.log(error);
  }
};
