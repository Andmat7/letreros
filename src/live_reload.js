// While the page is served by tools/dev_server.py, it reloads itself when the files it loads change.
// GitHub Pages has no such server, so there the page never asks.
const poll_milliseconds = 1500;

export function reload_on_change(page) {
  if (window.location.hostname !== 'localhost') return;
  let known_version = null;
  setInterval(async () => {
    const version = await fetch(`/live_version?page=${page}`).then((response) => (response.ok ? response.text() : null)).catch(() => null);
    if (version && known_version && version !== known_version) window.location.reload();
    known_version = version ?? known_version;
  }, poll_milliseconds);
}
