/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const { GObject, St, Clutter } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Data = Me.imports.api.data;
const CryptoUtil = Me.imports.utils.cryptoUtil;

const Settings = Me.imports.settings;
const { CoinItem } = Me.imports.models.coinItem;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

let current_exchange;

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, `${Me.metadata.name} Indicator`, false);
      this.coins = [];
      this.menuItem = new St.Label({
        text: '₿',
        y_expand: true,
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'menu-item-text',
      });
      this.add_child(this.menuItem);

      this.coinSection = new PopupMenu.PopupMenuSection();
      this.menu.addMenuItem(this.coinSection);

      // set current exchange
      current_exchange = Data.get_exchange();
    }

    _buildAddCoinSection() {
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      let addCoinBtnMenu = new PopupMenu.PopupSubMenuMenuItem('Add New Pair');
      this.menu.addMenuItem(addCoinBtnMenu);

      let addCoinSubMenu = new PopupMenu.PopupBaseMenuItem({
        reactive: false,
        can_focus: false,
      });
      addCoinBtnMenu.menu.addMenuItem(addCoinSubMenu);

      let vbox = new St.BoxLayout({
        style_class: 'add-coin-vbox',
        vertical: true,
        x_expand: true,
      });
      addCoinSubMenu.actor.add_child(vbox);

      let exchangeLbl = new St.Label({
        text: 'Exchange:',
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'crypto-label',
      });
      vbox.add(exchangeLbl);

      let exchangeHbox = new St.BoxLayout({
        x_expand: true,
        style_class: 'exchange-hbox',
      });
      vbox.add(exchangeHbox);

      let btns = [];
      for (const [key, val] of Object.entries(Data.exchanges)) {
        let exchangeBtnHbox = new St.BoxLayout({
          x_expand: true,
        });
        let exchangeIco = new St.Icon({
          style_class: `popup-menu-icon exchange-icon ${val.toLowerCase()}`,
        });
        let exchangeLbl = new St.Label({
          text: `${val}`,
          style_class: 'crypto-label',
        });
        exchangeBtnHbox.add(exchangeIco);
        exchangeBtnHbox.add(exchangeLbl);

        let btn = new St.Button({
          child: exchangeBtnHbox,
          style_class: 'btn exchange-btn',
          y_align: Clutter.ActorAlign.CENTER,
        });

        if (val === Data.get_exchange()) {
          btn.checked = true;
        }

        btn.connect('clicked', (self) => {
          current_exchange = val;
          Data.change_exchange(current_exchange);
          btns.forEach((self) => {
            self.checked = false;
          });
          self.checked = true;
        });

        exchangeHbox.add(btn);
        btns.push(btn);
      }

      let hbox = new St.BoxLayout({ x_expand: true });
      vbox.add(hbox);

      let coinSymbol = new St.Entry({
        name: 'symbol',
        hint_text: 'Name/Vol     ',
        can_focus: true,
        x_expand: true,
        style_class: 'crypto-input',
      });
      hbox.add(coinSymbol);

      let coinTitle = new St.Entry({
        name: 'title',
        hint_text: 'Label?',
        can_focus: true,
        x_expand: true,
        style_class: 'crypto-input',
      });
      hbox.add(coinTitle);

      let saveIcon = new St.Icon({
        icon_name: 'media-floppy-symbolic',
        style_class: 'popup-menu-icon',
      });
      let addBtn = new St.Button({
        child: saveIcon,
        style_class: 'crypto-input btn',
      });
      addBtn.connect(
        'clicked',
        this._addCoin.bind(this, coinSymbol, coinTitle)
      );
      hbox.add(addBtn);
    }

    _addCoin(coinSymbol, coinTitle) {
      // TODO show error
      if (coinSymbol.text === '' || !coinSymbol.text.includes('/')) return;

      let coin = {
        id: `${CryptoUtil.createUUID()}`,
        symbol: `${coinSymbol.text}`,
        active: false,
        title: `${coinTitle.text}`,
        exchange: `${current_exchange}`,
      };

      let result = Settings.addCoin(coin);

      if (result) this._buildCoinsSection();

      coinTitle.text = '';
      coinSymbol.text = '';
    }

    _buildCoinsSection() {
      this._setCoinsFromSettings();
      this.coinSection.removeAll();
      for (const coin of this.coins) {
        this.coinSection.addMenuItem(coin);
      }
    }

    _setCoinsFromSettings() {
      this.coins = [];
      let coins = Settings.getCoins();
      for (const coin of coins) {
        if (!coin.id) {
          coin.id = CryptoUtil.createUUID();
          Settings.setCoinId(coin);
        }
        if (!coin.exchange) {
          coin.exchange = current_exchange;
          Settings.updateCoin(coin);
        }
        let _coin = new CoinItem(coin, this.menuItem, this.coins);
        this.coins.push(_coin);
      }
    }
  }
);

class Extension {
  constructor(uuid) {
    this._uuid = uuid;
  }

  enable() {
    this._indicator = new Indicator();

    this._indicator._buildCoinsSection();
    this._indicator._buildAddCoinSection();

    Main.panel.addToStatusArea(this._uuid, this._indicator);
  }

  disable() {
    this._indicator.destroy();
    this._indicator = null;
    Settings._settings = null;
  }
}

function init(meta) {
  return new Extension(meta.uuid);
}
