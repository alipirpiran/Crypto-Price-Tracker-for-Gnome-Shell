const { Clutter, GLib, GObject, St } = imports.gi;

import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';
const Me = ExtensionUtils.getCurrentExtension();

import SourceClient from './api/sourceClient.js';
import Settings from './settings.js';

import PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

var AddCoinSourceBoxLayout = GObject.registerClass(
  class AddCoinSourceBoxLayout extends St.BoxLayout {
    _init(addCoinMenuItem) {
      super._init({
        vertical: true,
        x_expand: true,
      });
      this.addCoinMenuItem = addCoinMenuItem;

      let hbox = new St.BoxLayout({
        x_expand: true,
        style_class: 'exchange-hbox',
      });
      this.add(hbox);

      this.sourceLbl = new St.Label({
        text: ('%s %s').format('Source: ', this.addCoinMenuItem.current_exchange),
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'crypto-label',
      });
      hbox.add(this.sourceLbl);

      let expander = new St.Bin({
        style_class: 'popup-menu-item-expander',
        x_expand: true,
      });
      hbox.add(expander);

      let changeSourceHbox = new St.BoxLayout({
        x_expand: true,
      });

      this.changeSourceIcon = new St.Icon({
        icon_name: 'go-next-symbolic',
        style_class: 'popup-menu-icon',
      });
      changeSourceHbox.add(this.changeSourceIcon);

      let changeSourceBtn = new St.Button({
        child: changeSourceHbox,
        style_class: 'crypto-input btn',
      });
      hbox.add(changeSourceBtn);

      this.isActiveChangeSource = false;
      changeSourceBtn.connect('clicked', (self) => {
        this.isActiveChangeSource = !this.isActiveChangeSource;
        this.changeSourceIcon.icon_name = (this.isActiveChangeSource) ? 'go-down-symbolic' : 'go-next-symbolic';
        if (this.isActiveChangeSource) {
          this.add_actor(this._scrollView);
        } else {
          this.remove_actor(this._scrollView)
        }
      });

      this.sourceSection = new St.BoxLayout({
        vertical: true,
        x_expand: false,
      });

      this._scrollView = new St.ScrollView({
        style_class: 'sources-scrollview',
        enable_mouse_scrolling: true,
        height: 80,
      });
      this._scrollView.set_policy(St.PolicyType.NEVER, St.PolicyType.AUTOMATIC);
      this._scrollView.add_actor(this.sourceSection);
      this._buildSourceButtons();
    }

    _buildSourceButtons() {
      let sourceBtnsHbox;
      let btns = [];
      for (let [ind, val] of Object.values(SourceClient.exchanges).entries()) {
        if (ind % 2 === 0) {
          sourceBtnsHbox = new St.BoxLayout({
            x_expand: true,
          });
          this.sourceSection.add(sourceBtnsHbox);
        }

        let exchangeBtnHbox = new St.BoxLayout({
          x_expand: true,
        });

        let exchangeIco = new St.Icon({
          style_class: `popup-menu-icon exchange-icon ${val.toLowerCase()}`,
        });
        exchangeBtnHbox.add(exchangeIco);

        let exchangeLbl = new St.Label({
          text: `${val}`,
          style_class: 'crypto-label',
        });
        exchangeBtnHbox.add(exchangeLbl);

        let btn = new St.Button({
          child: exchangeBtnHbox,
          style_class: 'btn exchange-btn',
          y_align: Clutter.ActorAlign.CENTER,
        });

        if (val === SourceClient.get_exchange()) {
          btn.checked = true;
        }

        btn.connect('clicked', (self) => {
          this.addCoinMenuItem.current_exchange = val;
          SourceClient.change_exchange(this.addCoinMenuItem.current_exchange);
          btns.forEach((self) => {
            self.checked = false;
          });
          self.checked = true;
          this.sourceLbl.text = ('%s %s').format('Source: ', this.addCoinMenuItem.current_exchange);
        });

        btns.push(btn);
        sourceBtnsHbox.add(btn);
      }
    }
  }
)