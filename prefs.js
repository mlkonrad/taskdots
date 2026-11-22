// Generated with AI for personal use.
// Do NOT upload to extensions.gnome.org (EGO) unless you understand JavaScript
// and can maintain this code.

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

function comboRow(settings, key, title, choices) {
    const nicks = Object.keys(choices);
    const row = new Adw.ComboRow({
        title,
        model: Gtk.StringList.new(Object.values(choices)),
        selected: nicks.indexOf(settings.get_string(key)),
    });
    row.connect('notify::selected', () => settings.set_string(key, nicks[row.selected]));
    return row;
}

export default class TaskdotsPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const displayRow = comboRow(settings, 'display', 'Show', {
            'icon': 'Icon',
            'icon-title': 'Icon and title',
            'title': 'Title',
        });

        const iconSizeRow = Adw.SpinRow.new_with_range(16, 24, 2);
        iconSizeRow.title = 'Icon size';
        settings.bind('icon-size', iconSizeRow, 'value', Gio.SettingsBindFlags.DEFAULT);
        const syncIconSize = () => (iconSizeRow.sensitive = settings.get_string('display') !== 'title');
        displayRow.connect('notify::selected', syncIconSize);
        syncIconSize();

        const positionRow = comboRow(settings, 'position', 'Position', {
            'left': 'Left',
            'center': 'Center',
            'right': 'Right',
        });

        const group = new Adw.PreferencesGroup();
        group.add(displayRow);
        group.add(iconSizeRow);
        group.add(positionRow);
        const page = new Adw.PreferencesPage();
        page.add(group);
        window.add(page);
    }
}
