import GObject from 'gi://GObject';
import St from 'gi://St';

import * as SourceClient from '../api/sourceClient.js';
import * as CryptoUtil from '../utils/cryptoUtil.js';
import * as Settings from '../settings.js';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { AddCoinSourceBoxLayout } from './addCoinSourceBoxLayout.js';

export let AddCoinMenuItem = GObject.registerClass(
  class AddCoinMenuItem extends PopupMenu.PopupBaseMenuItem {
    constructor(panelMenu, Me) {
      super({
        reactive: false,
        can_focus: false,
      });
      this.panelMenu = panelMenu;
      this.current_exchange = SourceClient.get_exchange();
      this.Me = Me;

      let vbox = new St.BoxLayout({
        style_class: 'add-coin-vbox',
        vertical: true,
        x_expand: true,
      });

      this.actor.add_child(vbox);

      let sourceBoxLayout = new AddCoinSourceBoxLayout(this);
      vbox.add_child(sourceBoxLayout);

      let hbox = new St.BoxLayout({ x_expand: true });
      vbox.add_child(hbox);

      let coinSymbol = new St.Entry({
        name: 'symbol',
        hint_text: 'Symbol/Vol     ',
        can_focus: true,
        x_expand: true,
        style_class: 'crypto-input',
      });
      hbox.add_child(coinSymbol);

      let coinTitle = new St.Entry({
        name: 'title',
        hint_text: 'Label?',
        can_focus: true,
        x_expand: true,
        style_class: 'crypto-input',
      });
      hbox.add_child(coinTitle);

      let saveIcon = new St.Icon({
        icon_name: 'media-floppy-symbolic',
        style_class: 'popup-menu-icon',
      });
      let addBtn = new St.Button({
        child: saveIcon,
        style_class: 'crypto-input btn',
      });
      addBtn.connect(
        'clicked',
        this._addCoin.bind(this, coinSymbol, coinTitle)
      );
      hbox.add_child(addBtn);
    }

    async _addCoin(coinSymbol, coinTitle) {
      // TODO show error
      if (coinSymbol.text === '' || !coinSymbol.text.includes('/')) return;

      let coingecko_id = '';
      if (this.current_exchange === SourceClient.exchanges.coingecko) {
        try {
          coingecko_id = await CryptoUtil.coingecko_symbol_to_id(
            coinSymbol.text.split('/')[0],
            this.Me
          );
        } catch (error) {
          console.log(error);
        }
      }

      let coin = {
        id: `${CryptoUtil.createUUID()}`,
        symbol: `${coinSymbol.text}`,
        active: false,
        title: `${coinTitle.text}`,
        exchange: `${this.current_exchange}`,
        coingecko_id,
      };

      try {
        let result = Settings.addCoin(coin);

        if (result) this.panelMenu._buildCoinsSection();
      } catch (error) {
        console.log(error);
      }

      coinTitle.text = '';
      coinSymbol.text = '';
    }
  }
);
