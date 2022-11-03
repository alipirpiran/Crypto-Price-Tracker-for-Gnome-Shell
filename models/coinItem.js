const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Signals = imports.signals;
const Atk = imports.gi.Atk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Data = Me.imports.api.data;
const Settings = Me.imports.settings;

const PopupMenu = imports.ui.popupMenu;

var CoinItem = GObject.registerClass(
  {
    Signals: { toggled: { param_types: [GObject.TYPE_BOOLEAN] } },
  },
  class CoinItem extends PopupMenu.PopupBaseMenuItem {
    _init(symbol, active, title = null, menuItem, coins) {
      super._init({
        reactive: true,
        activate: true,
        hover: true,
        can_focus: true,
      });
      this.add_style_class_name('popup-submenu-menu-item');
      this._switch = new PopupMenu.Switch(active);

      this.accessible_role = Atk.Role.CHECK_MENU_ITEM;
      this.checkAccessibleState();

      let icon = new St.Icon({
        icon_name: 'edit-delete-symbolic',
        style_class: 'popup-menu-icon',
      });
      let delBtn = new St.Button({
        child: icon,
        style_class: 'btn m0',
      });
      delBtn.connect('clicked', this._delCoin.bind(this));
      this.add_child(delBtn);

      this.label = new St.Label({
        text: title || symbol,
        y_expand: true,
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.add_child(this.label);

      let expander = new St.Bin({
        style_class: 'popup-menu-item-expander',
        x_expand: true,
      });
      this.add_child(expander);

      this._statusBin = new St.Bin({
        // x_align: Clutter.ActorAlign.END,
        // x_expand: true,
      });
      this.add_child(this._statusBin);
      this._statusBin.child = this._switch;

      // this.text = text;
      this.symbol = symbol;
      this.activeCoin = active;
      this.title = title;
      this.timeOutTage;
      this.coins = coins;

      if (active) this._activeCoin(menuItem, true);
      this._startTimer(menuItem);

      this.connect('toggled', this.toggleCoin.bind(this, menuItem));
    }
    _activeCoin(menuItem, isInit) {
      this.activeCoin = true;
      Settings.updateCoin(this._getJSON());

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
        symbol: this.symbol,
        active: this.activeCoin,
        title: this.title,
      };
    }
    _getPrice() {
      const parts = this.symbol.split('/');

      return Data.getPrice(parts[0], parts[1]);
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
          menuItem.text = menuItem.text.replace(
            re,
            `${this.title || this.symbol} ${price}`
          );
        }
        this.label.text = `${this.title || this.symbol}    ${price}     `;
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
      if (this._switch.mapped) this.toggle();

      // we allow pressing space to toggle the switch
      // without closing the menu
      if (
        event.type() == Clutter.EventType.KEY_PRESS &&
        event.get_key_symbol() == Clutter.KEY_space
      )
        return;

      super.activate(event);
    }

    toggle() {
      this._switch.toggle();
      this.emit('toggled', this._switch.state);
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
      let newMenuItemText = this.coins
        .filter(({ activeCoin }) => activeCoin)
        .map(({ title, symbol }) => `${title || symbol} ...`)
        .join(' | ');

      if (isInit)
        newMenuItemText +=
          (newMenuItemText ? ' | ' : '') + `${this.title || this.symbol} ...`;

      menuItem.text = newMenuItemText || '₿';
    }

    _delCoin() {
      Settings.delCoin({ symbol: this.symbol });
      this.destroy();
    }

    destroy() {
      this.removeTimer();
      super.destroy();
    }
  }
);
