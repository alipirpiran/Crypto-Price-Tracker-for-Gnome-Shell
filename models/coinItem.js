'use strict';
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Signals = imports.signals;
const Atk = imports.gi.Atk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Binance = Me.imports.api.binance;
const Settings = Me.imports.settings;
const convenience = Me.imports.convenience;

const Schema = convenience.getSettings(
    'org.gnome.shell.extensions.crypto-tracker'
);

const PopupMenu = imports.ui.popupMenu;

var CoinItem = GObject.registerClass(
    {
        Signals: { toggled: { param_types: [GObject.TYPE_BOOLEAN] } },
    },
    class CoinItem extends PopupMenu.PopupBaseMenuItem {
        _init(symbol, active) {
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
                text: symbol,
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
            this.timeOutTage;

            if (active) this._activeCoin();
            this._startTimer();

            this.connect('toggled', this.toggleCoin.bind(this));
        }
        _activeCoin() {
            let menuItem = Me.imports.extension.menuItem;

            this._refreshPrice(menuItem);
            menuItem.text = this.symbol + ' ...';
            this.activeCoin = true;
        }
        _getPrice() {
            let symbol = this.symbol;
            symbol = symbol.replace('/', '');

            return Binance.getCoin(symbol);
        }

        _startTimer() {
            let menuItem = Me.imports.extension.menuItem;

            this._refreshPrice(menuItem);

            this.timeOutTag = GLib.timeout_add(1, 1000 * 10, async () => {
                this._refreshPrice(menuItem);
                return true;
            });
        }
        async _refreshPrice(menuItem) {
            let result = await this._getPrice();
            const jsonRes = JSON.parse(result.body);
            let price = jsonRes.price;
            let priceParts = price.split('.');

            const totalLen = 6;
            let len = 0;
            len += priceParts[0].length;
            price = priceParts[0] + '.';
            let i = 0;
            for (len; len < totalLen; len++) {
                price += priceParts[1][i];
                i++;
            }
            if (+price == 0)
                for (let i = len; i < priceParts[1].length; i++) {
                    price += priceParts[1][i];
                }

            if (this.activeCoin) menuItem.text = `${this.symbol}   ${price}`;
            this.label.text = `${this.symbol}    ${price}     `;
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

        toggleCoin() {
            if (this.state) {
                this._activeCoin.bind(this)();
                this.disableOtherCoins();
            }
        }

        removeTimer() {
            if (this.timeOutTag) GLib.Source.remove(this.timeOutTag);
        }

        disableOtherCoins() {
            for (const coin of Me.imports.extension.indicator.coins) {
                if (coin == this) continue;
                if (coin.state) {
                    coin.toggle();
                    coin.activeCoin = false;
                }
            }
        }

        _delCoin() {
            Settings.delCoin({ symbol: this.symbol });
            this.destroy();
        }

        destroy() {
            super.destroy();
            this.removeTimer();
        }
    }
);
