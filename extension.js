'use strict';

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Atk = imports.gi.Atk;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;

const Binance = Me.imports.api.binance;
const { CoinItem } = Me.imports.models.coinItem;
const convenience = Me.imports.convenience;
const Schema = convenience.getSettings(
    'org.gnome.shell.extensions.crypto-tracker'
);
const Settings = Me.imports.settings;

const Config = imports.misc.config;
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

const SELECT_TEXT = 'Select';

var menuItem;

var Indicator = class CIndicator extends PanelMenu.Button {
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

    destroy() {
        super.destroy();
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

        let coinTitle = new St.Entry({
            name: 'title',
            hint_text: 'Coin Name',
            can_focus: true,
            x_expand: true,
            style_class: 'crypto-input',
        });
        hbox.add(coinTitle);

        let coinSymbol = new St.Entry({
            name: 'symbol',
            hint_text: 'Coin Symbol',
            can_focus: true,
            x_expand: true,
            style_class: 'crypto-input',
        });
        hbox.add(coinSymbol);

        let addBtn = new St.Button({
            label: 'Add',
            style_class: 'crypto-input btn',
        });
        addBtn.connect(
            'clicked',
            this._addCoin.bind(this, coinTitle, coinSymbol)
        );
        hbox.add(addBtn);
    }
    _addCoin(coinTitle, coinSymbol) {
        // TODO show error
        if (coinTitle.text == '' || coinSymbol.text == '') return;

        let coin = new CoinItem(coinSymbol.text, coinTitle.text, false);
        let result = Settings.addCoin({
            name: coin.text,
            symbol: coin.symbol,
            active: coin.activeCoin,
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
            let { name, symbol, active } = coin;
            let _coin = new CoinItem(symbol, name, active);
            this.coins.push(_coin);
        }
    }
};

if (SHELL_MINOR > 30) {
    Indicator = GObject.registerClass({ GTypeName: 'Indicator' }, Indicator);
}

var indicator = null;

function addCoin(coin, reset) {
    if (reset == true) indicator.coins = [];
    indicator.coins.push(coin);
}

function init() {}

function enable() {
    indicator = new Indicator();

    indicator._buildCoinsSection();
    indicator._generateAddCoinPart();

    Main.panel.addToStatusArea(`${Me.metadata.name} Indicator`, indicator);
}

function disable() {
    if (indicator !== null) {
        indicator.destroy();
        indicator = null;
    }
}
