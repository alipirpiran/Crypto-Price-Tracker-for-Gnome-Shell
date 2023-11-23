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

import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';

import {Extension as Ex} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as SourceClient from './api/sourceClient.js';
import * as CryptoUtil from './utils/cryptoUtil.js';

import * as Settings from './settings.js';
import { CoinMenuItem } from './models/coinMenuItem.js';
import { AddCoinMenuItem } from './models/addCoinMenuItem.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    constructor(metadata) {
      super(0.0, `${metadata.name} Indicator`, false);
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

      this.coinsScrollViewVbox = new St.BoxLayout({
        vertical: true,
        x_expand: false,
      });
      this.coinsCountChangeToScroll = 0;
      const baseMenuItem = new PopupMenu.PopupBaseMenuItem({
        hover: false,
        can_focus: false,
        activate: false,
        reactive: false,
      });
      this.coinSection.addMenuItem(baseMenuItem);

      this._coinsScrollview = new St.ScrollView({
        enable_mouse_scrolling: true,
      });
      this._coinsScrollview.set_policy(
        St.PolicyType.NEVER,
        St.PolicyType.AUTOMATIC
      );
      this._coinsScrollview.add_actor(this.coinsScrollViewVbox);
      baseMenuItem.add_child(this._coinsScrollview);
    }

    _buildAddCoinSection(Me) {
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      let addCoinBtnMenu = new PopupMenu.PopupSubMenuMenuItem('Add New Pair');
      addCoinBtnMenu.add_style_class_name('add-coin-btn');
      this.menu.addMenuItem(addCoinBtnMenu);

      let addCoinSubMenu = new AddCoinMenuItem(this, Me);
      addCoinBtnMenu.menu.addMenuItem(addCoinSubMenu);
    }

    _buildCoinsSection() {
      this._setCoinsFromSettings();

      for (const coin of this.coins) {
        this.coinsScrollViewVbox.add_child(coin);
      }
      this._coinsScrollview.set_height(
        CryptoUtil.getHeight(this.coinsScrollViewVbox.height)
      );
    }

    _setCoinsFromSettings() {
      let current_exchange = SourceClient.get_exchange();
      let _coins = Settings.getCoins();

      for (const c of this.coins) c.destroy();
      this.coins = [];

      for (const coin of _coins) {
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
  }
);

export default class Extension extends Ex {
  constructor(meta) {
    super(meta)
  }

  enable() {
    this._indicator = new Indicator(this.metadata);
    this._indicator._buildCoinsSection();
    this._indicator._buildAddCoinSection(this);
    this._settings = this.getSettings("org.gnome.shell.extensions.crypto-tracker")

    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    this._indicator.destroy();
    this._indicator = null;
    this._settings = null;
  }
}
