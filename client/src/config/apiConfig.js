const port = 3000;
let API_URL = "";
let WS_URL = "";

if (window?.location?.protocol && window?.location?.hostname) {
  API_URL = `${window.location.protocol}//${window.location.hostname}:${port}`;
  WS_URL = `ws://${window.location.hostname}:${port}`;
} else {
  API_URL = import.meta.env.VITE_API_URL;
  WS_URL = import.meta.env.VITE_WEBSOCKET_URL;
}

export { API_URL, WS_URL };
