// noinspection DuplicatedCode
import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as SourceClient from '../api/sourceClient.js';
import * as Settings from '../settings.js';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Util from 'resource:///org/gnome/shell/misc/util.js';

export var CoinMenuItem = GObject.registerClass(
  class CoinMenuItem extends PopupMenu.PopupBaseMenuItem {
    _init(coin, menuItem, coins, panelMenu) {
      super._init({
        reactive: true,
        activate: true,
        hover: true,
        can_focus: true,
      });

      this.id = coin.id;
      this.symbol = coin.symbol;
      this.coingecko_id = coin.coingecko_id;
      this.activeCoin = coin.active;
      this.title = coin.title;
      this.exchange = coin.exchange;
      this.coins = coins;
      this.panelMenu = panelMenu;

      this.add_style_class_name('popup-submenu-menu-item');
      this._switch = new PopupMenu.Switch(this.activeCoin);

      this.accessible_role = Atk.Role.CHECK_MENU_ITEM;
      this.checkAccessibleState();

      let viewIcon = new St.Icon({
        style_class: `popup-menu-icon exchange-icon ${this.exchange.toLowerCase()}`,
      });

      let viewBtn = new St.Button({
        child: viewIcon,
        style_class: 'btn m0',
      });
      viewBtn.connect('clicked', this._openChart.bind(this));
      this.add_child(viewBtn);

      this.nameLbl = new St.Label({
        text: this.title || this.symbol,
        style_class: 'itemLabel',
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.add_child(this.nameLbl);

      let expander = new St.Bin({
        style_class: 'popup-menu-item-expander',
        x_expand: true,
      });
      this.add_child(expander);

      this.priceLbl = new St.Label({
        text: '...',
        style_class: 'itemLabel text-align-right',
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.add_child(this.priceLbl);

      this._statusBtn = new St.Button({
        x_align: Clutter.ActorAlign.START,
        // x_expand: true,
        child: this._switch,
      });
      this._statusBtn.connect('clicked', this._toggle.bind(this, menuItem));
      this.add_child(this._statusBtn);

      let icon = new St.Icon({
        icon_name: 'edit-delete-symbolic',
        style_class: 'popup-menu-icon',
      });
      let delBtn = new St.Button({
        child: icon,
        style_class: 'btn m0',
      });
      delBtn.connect('clicked', this._delCoin.bind(this, menuItem));
      this.add_child(delBtn);

      if (this.activeCoin) this._activeCoin(menuItem, true);
      this._startTimer(menuItem);

      this.connect('enter-event', () => {
        viewIcon.icon_name = 'external-link-symbolic';
        viewIcon.style_class = `popup-menu-icon w18`;
      });
      this.connect('leave-event', () => {
        viewIcon.icon_name = '';
        viewIcon.style_class = `popup-menu-icon exchange-icon ${this.exchange.toLowerCase()}`;
      });
    }
    _activeCoin(menuItem, isInit) {
      this.activeCoin = true;

      if (!isInit) Settings.updateCoin(this._getJSON());

      this._updateMenuCoinItems(menuItem, isInit);
      this._refreshPrice(menuItem);
    }
    _disableCoin(menuItem) {
      this.activeCoin = false;
      Settings.updateCoin(this._getJSON());

      this._updateMenuCoinItems(menuItem);
    }
    _getJSON() {
      return {
        id: this.id,
        symbol: this.symbol,
        active: this.activeCoin,
        title: this.title,
        exchange: this.exchange,
      };
    }
    _getPrice() {
      var parts = this.symbol.split('/');
      if (this.exchange === SourceClient.exchanges.coingecko) {
        parts[0] = this.coingecko_id;
      }

      return SourceClient.getPrice(parts[0], parts[1], this.exchange);
    }

    _startTimer(menuItem) {
      this._refreshPrice(menuItem);

      this.timeOutTag = GLib.timeout_add(1, 1000 * 10, async () => {
        this._refreshPrice(menuItem);
        return true;
      });
    }
    async _refreshPrice(menuItem) {
      try {
        let price = await this._getPrice();
        if (!price) return; // if error happened, not change current price.

        if (this.activeCoin) {
          let re = new RegExp(
            '(' +
              `${this.title || this.symbol}` +
              ') ((\\.\\.\\.)|(\\d*(,?\\d\\d\\d)*|\\d+)(\\.?\\d*))?',
            'g'
          );
          let menuPairPrice = isNaN(price.replaceAll(',', '')) ? '...' : price;
          menuItem.text = menuItem.text.replace(
            re,
            `${this.title || this.symbol} ${menuPairPrice}`
          );
        }
        this.nameLbl.text = `${this.title || this.symbol}`;
        this.priceLbl.text = `${price}`;
      } catch (error) {}
    }
    get state() {
      return this._switch.state;
    }
    setToggleState(state) {
      this._switch.state = state;
      this.checkAccessibleState();
    }

    activate(event) {
      if (this._switch.mapped) return;

      // we allow pressing space to toggle the switch
      // without closing the menu
      if (
        event.type() === Clutter.EventType.KEY_PRESS &&
        event.get_key_symbol() === Clutter.KEY_space
      )
        return;

      super.activate(event);
    }

    _toggle(menu) {
      this._switch.toggle();
      this.toggleCoin(menu);
      this.checkAccessibleState();
    }

    checkAccessibleState() {
      switch (this.accessible_role) {
        case Atk.Role.CHECK_MENU_ITEM:
          if (this._switch.state)
            this.add_accessible_state(Atk.StateType.CHECKED);
          else this.remove_accessible_state(Atk.StateType.CHECKED);
          break;
        default:
          this.remove_accessible_state(Atk.StateType.CHECKED);
      }
    }

    toggleCoin(menuItem) {
      if (this.state) {
        this._activeCoin(menuItem);
      } else {
        this._disableCoin(menuItem);
      }
    }

    removeTimer() {
      if (this.timeOutTag) GLib.Source.remove(this.timeOutTag);
    }

    _updateMenuCoinItems(menuItem, isInit) {
      let activeCoins = this.coins.filter(({ activeCoin }) => activeCoin);
      let newMenuItemText = activeCoins
        .map(({ title, symbol }) => `${title || symbol} ...`)
        .join(' | ');

      if (isInit)
        newMenuItemText +=
          (newMenuItemText ? ' | ' : '') + `${this.title || this.symbol} ...`;

      menuItem.text = newMenuItemText || '₿';

      if (!isInit) activeCoins.forEach((coin) => coin._refreshPrice(menuItem));
    }

    _delCoin(menuItem) {
      Settings.delCoin({ id: this.id });

      let index = this.coins.findIndex((coin) => {
        return coin.id === this.id;
      });
      if (index !== -1) this.coins.splice(index, 1);
      this._updateMenuCoinItems(menuItem, false);

      this.destroy();
      this.panelMenu._buildCoinsSection()
    }

    _openChart() {
      let chartUrl = '';
      try {
        chartUrl = SourceClient.getChartUrl(
          this.coingecko_id || this.symbol,
          this.exchange
        );
        Util.spawnCommandLine(`xdg-open ${chartUrl}`);
      } catch (err) {
        let title = _('Can not open %s').format(chartUrl);
        Main.notifyError(title, err);
      }
    }

    destroy() {
      this.removeTimer();
      super.destroy();
    }
  }
);
