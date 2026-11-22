// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Indicator} from './lib/indicator.js';

export default class TaskdotsExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._settings.connectObject('changed', () => this._addIndicator(), this);
        this._addIndicator();
    }

    disable() {
        this._settings.disconnectObject(this);
        this._settings = null;
        this._indicator.destroy();
        this._indicator = null;
    }

    _addIndicator() {
        this._indicator?.destroy();
        this._indicator = new Indicator(this._settings);
        Main.panel.addToStatusArea(this.uuid, this._indicator, 0, this._settings.get_string('position'));
    }
}
