// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const MINIMIZED_OPACITY = 128;

export const WindowButton = GObject.registerClass(
class TaskdotsWindowButton extends St.Button {
    constructor(window, app, {display, iconSize}) {
        super({
            style_class: 'taskdots-button',
            button_mask: St.ButtonMask.PRIMARY | St.ButtonMask.MIDDLE,
            can_focus: true,
        });
        this.window = window;

        const content = new St.BoxLayout({style_class: 'taskdots-content', x_align: Clutter.ActorAlign.CENTER});
        if (display !== 'title') {
            content.add_child(app
                ? app.create_icon_texture(iconSize)
                : new St.Icon({icon_name: 'application-x-executable-symbolic', icon_size: iconSize}));
        }
        this._label = null;
        if (display !== 'icon') {
            this._label = new St.Label({style_class: 'taskdots-title', y_align: Clutter.ActorAlign.CENTER});
            this._label.clutter_text.ellipsize = Pango.EllipsizeMode.END;
            content.add_child(this._label);
        }

        const box = new St.BoxLayout({orientation: Clutter.Orientation.VERTICAL, y_align: Clutter.ActorAlign.CENTER});
        box.add_child(content);
        box.add_child(new St.Widget({style_class: 'taskdots-dot', x_align: Clutter.ActorAlign.CENTER}));
        this.set_child(box);

        this.window.connectObject(
            'notify::minimized', () => this.sync(),
            'notify::title', () => this._syncTitle(),
            this);
        this._syncTitle();
        this.sync();
    }

    _syncTitle() {
        const title = this.window.get_title() ?? '';
        this.accessible_name = title;
        if (this._label)
            this._label.text = title;
    }

    sync() {
        this.checked = this.window.has_focus();
        this.opacity = this.window.minimized ? MINIMIZED_OPACITY : 255;
    }

    vfunc_clicked(clickedButton) {
        if (clickedButton === Clutter.BUTTON_MIDDLE)
            this.window.delete(global.get_current_time());
        else if (this.window.has_focus() && !this.window.minimized)
            this.window.minimize();
        else
            Main.activateWindow(this.window);
    }

    destroy() {
        this.window.disconnectObject(this);
        super.destroy();
    }
});
