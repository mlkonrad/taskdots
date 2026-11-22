# Taskdots

A minimal window list for the GNOME Shell top bar: one icon per window on the
current workspace, with a dot under the focused one.

- Click: focus the window, or minimize it if it is already focused
- Middle-click: close the window
- Scroll: switch between windows
- Preferences: put it on the left, center or right of the top bar

## Build and install

```sh
gnome-extensions pack --force --extra-source=lib .
gnome-extensions install --force taskdots@mlkonrad.github.com.shell-extension.zip
```

Log out and back in (Wayland), then:

```sh
gnome-extensions enable taskdots@mlkonrad.github.com
gnome-extensions prefs taskdots@mlkonrad.github.com
```

## Development

```sh
./scripts/dev-session.sh
```

Opens a nested GNOME Shell window (needs the `mutter-devkit` package) with
only Taskdots enabled, loaded from this checkout. It uses its own config in
`~/.cache/taskdots-dev`, so your real session is not touched. After editing
code, close the window and run it again.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).
