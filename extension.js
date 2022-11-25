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
const SourceClient = Me.imports.api.sourceClient;
const CryptoUtil = Me.imports.utils.cryptoUtil;

const Settings = Me.imports.settings;
const { CoinMenuItem } = Me.imports.models.coinMenuItem;
const { AddCoinMenuItem } = Me.imports.models.addCoinMenuItem;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, `${Me.metadata.name} Indicator`, false);
      this.coinsScrollViewVbox = null;
      this.coinsCountChangeToScroll = 0;
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
    }

    _buildAddCoinSection() {
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      let addCoinBtnMenu = new PopupMenu.PopupSubMenuMenuItem('Add New Pair');
      addCoinBtnMenu.add_style_class_name('add-coin-btn');
      this.menu.addMenuItem(addCoinBtnMenu);

      let addCoinSubMenu = new AddCoinMenuItem(this);
      addCoinBtnMenu.menu.addMenuItem(addCoinSubMenu);
    }

    _buildCoinsSection() {
      this._setCoinsFromSettings();
      if (!this.coinsScrollViewVbox) this.coinSection.removeAll();

      for (const coin of this.coins) {
        if (this.coinsScrollViewVbox) {
          this.coinsScrollViewVbox.add_child(coin);
        } else {
          this.coinSection.addMenuItem(coin);
        }
      }
    }

    _setCoinsFromSettings() {
      this.coins = [];
      let current_exchange = SourceClient.get_exchange();
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
        let _coin = new CoinMenuItem(coin, this.menuItem, this.coins, this);
        this.coins.push(_coin);
      }
    }

    checkHeight() {
      const ratio = 0.4;
      const monitor = global.display.get_primary_monitor();
      const workAreaHeight =
        Main.layoutManager.getWorkAreaForMonitor(monitor).height;
      const boxHeight = this.coinSection.box.height;

      if (
        this.coinsScrollViewVbox &&
        this.coins.length < this.coinsCountChangeToScroll
      ) {
        this.coinsScrollViewVbox = null;
        this._buildCoinsSection();
        return;
      }
      if (this.coinsScrollViewVbox || boxHeight / workAreaHeight < ratio)
        return;

      this.coinsCountChangeToScroll = this.coins.length;

      this.coinsScrollViewVbox = new St.BoxLayout({
        vertical: true,
        x_expand: false,
      });

      var _coinsScrollview = new St.ScrollView({
        enable_mouse_scrolling: true,
        height: ratio * workAreaHeight,
      });
      _coinsScrollview.set_policy(St.PolicyType.NEVER, St.PolicyType.AUTOMATIC);
      _coinsScrollview.add_actor(this.coinsScrollViewVbox);

      const baseMenuItem = new PopupMenu.PopupBaseMenuItem({
        hover: false,
        can_focus: false,
        activate: false,
        reactive: false,
      });
      baseMenuItem.add_child(_coinsScrollview);
      this.coinSection.removeAll();
      this.coinSection.addMenuItem(baseMenuItem);
      this._buildCoinsSection();
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
    this._indicator.checkHeight();

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
