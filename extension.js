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

const Settings = Me.imports.settings;
const { CoinItem } = Me.imports.models.coinItem;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

let menuItem, _extension;

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, `${Me.metadata.name} Indicator`, false);
      this.coins = [];
      menuItem = new St.Label({
        text: 'Crypto',
        y_expand: true,
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.actor.add_child(menuItem);

      this.coinSection = new PopupMenu.PopupMenuSection();
      this.menu.addMenuItem(this.coinSection);
    }

    _generateAddCoinPart() {
      let addCoinBtnMenu = new PopupMenu.PopupSubMenuMenuItem('Add Coin');
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

      let addBtn = new St.Button({
        label: 'Add',
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
      if (coinSymbol.text == '' || !coinSymbol.text.includes('/')) return;

      let coin = new CoinItem(coinSymbol.text, false, coinTitle.text);
      let result = Settings.addCoin({
        symbol: coin.symbol,
        active: coin.activeCoin,
        title: coin.title,
      });
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
        let { symbol, active, title } = coin;
        let _coin = new CoinItem(symbol, active, title);
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
    this._indicator._generateAddCoinPart();

    Main.panel.addToStatusArea(this._uuid, this._indicator);
  }

  disable() {
    this._indicator.destroy();
    this._indicator = null;
  }
}

function init(meta) {
  _extension = new Extension(meta.uuid);
  return _extension;
}
