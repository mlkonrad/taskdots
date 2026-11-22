// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import {WindowButton} from './windowButton.js';

export const Indicator = GObject.registerClass(
class TaskdotsIndicator extends PanelMenu.Button {
    constructor(settings) {
        super(0.5, 'Taskdots', true);
        this.add_style_class_name('taskdots');

        this._box = new St.BoxLayout({style_class: 'taskdots-box'});
        this.add_child(this._box);

        this._buttonOptions = {
            display: settings.get_string('display'),
            iconSize: settings.get_int('icon-size'),
        };
        this._buttons = [];
        this._workspace = null;
        this._tracker = Shell.WindowTracker.get_default();

        global.display.connectObject('notify::focus-window', () => this._syncButtons(), this);
        global.workspace_manager.connectObject('active-workspace-changed', () => this._trackActiveWorkspace(), this);
        this._tracker.connectObject('tracked-windows-changed', () => this._rebuild(), this);
        this._trackActiveWorkspace();
    }

    _trackActiveWorkspace() {
        this._workspace?.disconnectObject(this);
        this._workspace = global.workspace_manager.get_active_workspace();
        this._workspace.connectObject(
            'window-added', () => this._rebuild(),
            'window-removed', () => this._rebuild(),
            this);
        this._rebuild();
    }

    _rebuild() {
        this._destroyButtons();

        const windows = global.display.get_tab_list(Meta.TabList.NORMAL, this._workspace)
            .sort((a, b) => a.get_stable_sequence() - b.get_stable_sequence());
        for (const window of windows) {
            const button = new WindowButton(window, this._tracker.get_window_app(window), this._buttonOptions);
            this._box.add_child(button);
            this._buttons.push(button);
        }
        this.visible = windows.length > 0;
    }

    _syncButtons() {
        for (const button of this._buttons)
            button.sync();
    }

    _destroyButtons() {
        for (const button of this._buttons)
            button.destroy();
        this._buttons = [];
    }

    vfunc_scroll_event(event) {
        const direction = event.get_scroll_direction();
        let step;
        if (direction === Clutter.ScrollDirection.UP || direction === Clutter.ScrollDirection.LEFT)
            step = -1;
        else if (direction === Clutter.ScrollDirection.DOWN || direction === Clutter.ScrollDirection.RIGHT)
            step = 1;
        else
            return Clutter.EVENT_PROPAGATE;

        const windows = this._buttons.map(button => button.window);
        if (windows.length === 0)
            return Clutter.EVENT_PROPAGATE;

        let current = windows.indexOf(global.display.focus_window);
        if (current < 0)
            current = step > 0 ? -1 : 0;
        Main.activateWindow(windows[(current + step + windows.length) % windows.length]);
        return Clutter.EVENT_STOP;
    }

    destroy() {
        global.display.disconnectObject(this);
        global.workspace_manager.disconnectObject(this);
        this._tracker.disconnectObject(this);
        this._workspace.disconnectObject(this);
        this._workspace = null;

        this._destroyButtons();
        super.destroy();
    }
});
