const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");

process.env.NODE_ENV = "production";

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "production";

let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
    autoHideMenuBar: true,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

app.whenReady().then(() => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

const menu = [
  {
    // label: "File",
    // submenu: [
    //   {
    //     label: "Exit App",
    //     click: () => app.quit(),
    //     accelerator: "CmdOrCtrl+W",
    //   },
    // ],
    role: "fileMenu",
  },
  {
    label: "Help",
    submenu: [
      {
        label: "About",
        click: createAboutWindow,
        accelerator: "CmdOrCtrl+H",
      },
    ],
  },
];

ipcMain.on("image:re-size", (e, options) => {
  options.destination = path.join(os.homedir(), "resized-image");
  resizeUploadedImage(options);
});

async function resizeUploadedImage({ imgPath, width, height, destination }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    const newFileName = path.basename(imgPath);

    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }

    fs.writeFileSync(path.join(destination, newFileName), newPath);

    mainWindow.webContents.send("image:resized-success");

    shell.openPath(destination);
  } catch (e) {}
}

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});
