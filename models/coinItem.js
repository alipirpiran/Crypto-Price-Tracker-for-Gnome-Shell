'use strict';
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
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
        _init(symbol, text, active) {
            super._init({
                reactive: true,
                activate: false,
                hover: true,
                can_focus: true,
            });
            this.add_style_class_name('popup-submenu-menu-item');

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

            // let expander = new St.Bin({
            //     style_class: 'popup-menu-item-expander',
            //     x_expand: true,
            // });
            // this.add_child(expander);

            this.label = new St.Label({
                text,
                y_expand: true,
                y_align: Clutter.ActorAlign.CENTER,
            });
            this.add_child(this.label);

            this.text = text;
            this.symbol = symbol;
            this.activeCoin = active;
            this.timeOutTage;

            if (active) this._activeCoin();
            this._startTimer();

            this.connect('toggled', this.toggleCoin.bind(this));
        }
        _activeCoin() {
            let menuItem = Me.imports.extension.menuItem;

            menuItem.text = this.text + ' ...';
            this.activeCoin = true;
        }
        _getPrice() {
            return Binance.getCoin(this.symbol);
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

            if (this.activeCoin) menuItem.text = `${this.text} $ ${price}`;
            this.label.text = `${this.text}   $ ${price}     `;
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
            Settings.delCoin({ name: this.text });
            this.destroy();
        }

        destroy() {
            super.destroy();
        }
    }
);
