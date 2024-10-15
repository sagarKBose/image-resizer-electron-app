const { contextBridge, ipcRenderer, webUtils } = require("electron");
const os = require("os");
const path = require("path");
const toastify = require("toastify-js");

contextBridge.exposeInMainWorld("operatingSys", {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld("exportPath", {
  join: (...args) => path.join(...args),
});

contextBridge.exposeInMainWorld("Toastify", {
  toast: (options) => toastify(options).showToast(),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});

contextBridge.exposeInMainWorld("electron", {
  getFilePath(file) {
    const path = webUtils.getPathForFile(file);
    return path;
  },
});
