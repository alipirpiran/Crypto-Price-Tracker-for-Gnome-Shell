'use strict';

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;

const Binance = Me.imports.api.binance;

const Config = imports.misc.config;
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

let selectedIndex = 0;
const coinNames = ['BTC', 'ETC'];

const coins = [];
let btcItem, ethItem;
var menuItem;

var Indicator = class CIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, `${Me.metadata.name} Indicator`, false);

        menuItem = new St.Label({
            text: 'Crypto',
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.actor.add_child(menuItem);

        for (const coin of coins) {
            this.menu.addMenuItem(coin);
        }
    }

    destroy() {
        super.destroy();
    }
};

if (SHELL_MINOR > 30) {
    Indicator = GObject.registerClass({ GTypeName: 'Indicator' }, Indicator);
}

var indicator = null;

function init() {
    btcItem = new PopupMenu.PopupSwitchMenuItem('BTC', false);
    btcItem.statusAreaKey = 'BTC';
    btcItem.connect('toggled', toggleBTC);

    ethItem = new PopupMenu.PopupSwitchMenuItem('ETH', false);
    ethItem.statusAreaKey = 'ETH';
    btcItem.connect('toggled', toggleETH);

    coins.push(btcItem, ethItem);

    refreshPrice('BTC');
    GLib.timeout_add(1, 1000 * 10, async () => {
        refreshPrice('BTC');
        return true;
    });
}

async function refreshPrice(coin) {
    let result;
    if (coin == 'BTC') {
        result = await Binance.getBTC();
    }

    if (result == null) return;

    const jsonRes = JSON.parse(result.body);
    let price = jsonRes.price;
    let priceParts = price.split('.');
    price = priceParts[0] + '.';
    priceParts[1][0] ? (price += priceParts[1][0]) : null;
    priceParts[1][1] ? (price += priceParts[1][1]) : null;
    menuItem.text = `BTC ${price}`;
}

function toggleBTC() {
    log(btcItem.active)
}
function toggleETH() {}

function enable() {
    indicator = new Indicator();
    Main.panel.addToStatusArea(`${Me.metadata.name} Indicator`, indicator);
}

function disable() {
    if (indicator !== null) {
        indicator.destroy();
        indicator = null;
    }
}
