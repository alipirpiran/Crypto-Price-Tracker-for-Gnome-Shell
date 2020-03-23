'use strict';

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;

const Config = imports.misc.config;
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

let menuItem;
var Indicator = class ExampleIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, `${Me.metadata.name} Indicator`, false);

        let icon = new St.Icon({
            gicon: new Gio.ThemedIcon({ name: 'face-laugh-symbolic' }),
            style_class: 'system-status-icon',
        });
        this.actor.add_child(icon);

        menuItem = new PopupMenu.PopupSwitchMenuItem('BTC', false);
        this.menu.addMenuItem(menuItem);
    }

    destroy() {
        super.destroy();
    }
};

if (SHELL_MINOR > 30) {
    Indicator = GObject.registerClass(
        { GTypeName: 'Indicator' },
        Indicator
    );
}

var indicator = null;

function init() {}

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
