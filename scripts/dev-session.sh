#!/bin/sh -e
# Launches a nested GNOME Shell (Mutter Development Kit) with only Taskdots
# enabled, loaded straight from this checkout.
#
# The nested shell gets its own data and config directories, so the real
# session's dconf settings and installed extensions are never touched. Those
# directories persist between runs, so Taskdots' own settings survive.
#
# JS modules cannot be unloaded, so after editing code close the window (or
# Ctrl+C) and run this script again for a fresh gnome-shell process.

ROOT=$(cd "$(dirname "$0")/.." && pwd)
UUID=$(sed -n 's/.*"uuid": *"\([^"]*\)".*/\1/p' "$ROOT/metadata.json")
DEV=${XDG_CACHE_HOME:-$HOME/.cache}/taskdots-dev

mkdir -p "$DEV/data/gnome-shell/extensions" "$DEV/config" "$DEV/dbus-1/services"
ln -sfn "$ROOT" "$DEV/data/gnome-shell/extensions/$UUID"
glib-compile-schemas "$ROOT/schemas"

# Skip Secret Service probing, which otherwise adds ~30s of startup latency
# to every iteration.
cat > "$DEV/dbus-1/services/org.freedesktop.secrets.service" <<'EOF'
[D-BUS Service]
Name=org.freedesktop.secrets
Exec=/bin/false
EOF

# Cleanup: dbus-run-session only stops its dbus-daemon when gnome-shell exits
# normally. If the session is killed instead, the daemon and every
# bus-activated service (portals, gvfs, goa, evolution, ...) are reparented to
# systemd and live on. So the inner shell records the private bus address,
# and on exit we kill every process still carrying that address in its
# environment, then the daemon itself.
BUS_FILE=$(mktemp "${TMPDIR:-/tmp}/taskdots-dev-bus.XXXXXX")
RUN_PID=

cleanup() {
    trap - EXIT INT TERM HUP
    daemon=
    if [ -n "$RUN_PID" ]; then
        daemon=$(pgrep -P "$RUN_PID" -x dbus-daemon || true)
    fi
    addr=$(cat "$BUS_FILE" 2>/dev/null || true)
    if [ -n "$addr" ]; then
        for pid in $(pgrep -u "$(id -u)"); do
            if tr '\0' '\n' 2>/dev/null < "/proc/$pid/environ" |
                grep -qxF "DBUS_SESSION_BUS_ADDRESS=$addr"; then
                kill "$pid" 2>/dev/null || true
            fi
        done
    fi
    if [ -n "$daemon" ]; then
        kill $daemon 2>/dev/null || true
    fi
    if [ -n "$RUN_PID" ]; then
        kill "$RUN_PID" 2>/dev/null || true
    fi
    rm -f "$BUS_FILE"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP

# Run in the background and wait, so a signal to this script runs the trap
# right away instead of after the nested shell exits.
env GTK_A11Y=none ADW_DISABLE_PORTAL=1 \
    XDG_DATA_HOME="$DEV/data" \
    XDG_CONFIG_HOME="$DEV/config" \
    XDG_DATA_DIRS="$DEV:${XDG_DATA_DIRS:-/usr/local/share:/usr/share}" \
    dbus-run-session -- sh -c '
        printf %s "$DBUS_SESSION_BUS_ADDRESS" > "$1"
        gsettings set org.gnome.shell disable-user-extensions false
        gsettings set org.gnome.shell enabled-extensions "$2"
        exec gnome-shell --devkit --wayland' \
        sh "$BUS_FILE" "['$UUID']" &
RUN_PID=$!
status=0
wait "$RUN_PID" || status=$?
exit "$status"
