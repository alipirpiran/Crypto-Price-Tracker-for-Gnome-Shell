import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
const Me = Extension.lookupByUUID('crypto@alipirpiran.github');
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import Gio from 'gi://Gio';
import * as Config from 'resource:///org/gnome/shell/misc/config.js.in';
import ByteArray from 'gi://GjsGLib.ByteArray';

var coingecko_data = null;

var _get_coingecko_data = async () => {
  if (coingecko_data) return coingecko_data;

  //TODO update json file, if one coin not found. get from https://api.coingecko.com/api/v3/coins/list
  const file = Gio.File.new_for_path(Me.path + '/assets/coingecko.json');
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

var getHeight = (vboxHeight) => {
  const ratio = 0.4;
  const monitor = global.display.get_primary_monitor();
  const workAreaHeight =
    Main.layoutManager.getWorkAreaForMonitor(monitor).height;
  const maxHeight = ratio * workAreaHeight;

  return Math.min(vboxHeight, maxHeight);
};
