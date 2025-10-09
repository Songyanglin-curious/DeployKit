"use strict";
const { app, BrowserWindow } = require("electron");
require("path");
const WindowManager = require("./windowManager");
const IPCHandler = require("./ipcHandlers");
const ConfigManager = require("./configManager");
class ElectronApp {
  constructor() {
    this.windowManager = new WindowManager();
    this.configManager = new ConfigManager();
    this.init();
  }
  init() {
    this.setupAppEvents();
    IPCHandler.init(this.configManager);
  }
  setupAppEvents() {
    app.whenReady().then(() => {
      this.windowManager.createMainWindow();
      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.windowManager.createMainWindow();
        }
      });
    });
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") app.quit();
    });
  }
}
if (process.env.NODE_ENV === "development") {
  process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
}
new ElectronApp();
