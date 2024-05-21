import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as SourceClient from '../api/sourceClient.js';

export let AddCoinSourceBoxLayout = GObject.registerClass(
  class AddCoinSourceBoxLayout extends St.BoxLayout {
    constructor(addCoinMenuItem) {
      super({
        vertical: true,
        x_expand: true,
      });
      this.addCoinMenuItem = addCoinMenuItem;

      let hbox = new St.BoxLayout({
        x_expand: true,
        style_class: 'exchange-hbox',
      });
      this.add_child(hbox);

      this.sourceLbl = new St.Label({
        text: ('%s %s').format('Source: ', this.addCoinMenuItem.current_exchange),
        y_align: Clutter.ActorAlign.CENTER,
        style_class: 'crypto-label',
      });
      hbox.add_child(this.sourceLbl);

      let expander = new St.Bin({
        style_class: 'popup-menu-item-expander',
        x_expand: true,
      });
      hbox.add_child(expander);

      let changeSourceHbox = new St.BoxLayout({
        x_expand: true,
      });

      this.changeSourceIcon = new St.Icon({
        icon_name: 'go-next-symbolic',
        style_class: 'popup-menu-icon',
      });
      changeSourceHbox.add_child(this.changeSourceIcon);

      let changeSourceBtn = new St.Button({
        child: changeSourceHbox,
        style_class: 'crypto-input btn',
      });
      hbox.add_child(changeSourceBtn);

      this.isActiveChangeSource = false;
      changeSourceBtn.connect('clicked', (self) => {
        this.isActiveChangeSource = !this.isActiveChangeSource;
        this.changeSourceIcon.icon_name = (this.isActiveChangeSource) ? 'go-down-symbolic' : 'go-next-symbolic';
        if (this.isActiveChangeSource) {
          this.add_child(this._scrollView);
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
      this._scrollView.add_child(this.sourceSection);
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
          this.sourceSection.add_child(sourceBtnsHbox);
        }

        let exchangeBtnHbox = new St.BoxLayout({
          x_expand: true,
        });

        let exchangeIco = new St.Icon({
          style_class: `popup-menu-icon exchange-icon ${val.toLowerCase()}`,
        });
        exchangeBtnHbox.add_child(exchangeIco);

        let exchangeLbl = new St.Label({
          text: `${val}`,
          style_class: 'crypto-label',
        });
        exchangeBtnHbox.add_child(exchangeLbl);

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
        sourceBtnsHbox.add_child(btn);
      }
    }
  }
)
