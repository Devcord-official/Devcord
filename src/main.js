const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const https = require("https");
const path = require("path");
const { exec } = require("child_process");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 350,
        resizable: false,
        title: "Devcord Installer",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile("index.html");
});

// Install/Update Devcord
ipcMain.on("install-mod", (event) => {
    const repo = "YOUR_GITHUB_USERNAME/Devcord"; // Change this to your repo
    const downloadUrl = `https://github.com/${repo}/releases/latest/download/devcord.asar`;
    const installPath = path.join(process.env.APPDATA || process.env.HOME, "Devcord", "devcord.asar");

    fs.mkdirSync(path.dirname(installPath), { recursive: true });

    const file = fs.createWriteStream(installPath);
    event.reply("install-complete", "Downloading Devcord...");

    https.get(downloadUrl, (res) => {
        res.pipe(file);
        file.on("finish", () => {
            file.close(() => {
                event.reply("install-complete", "Devcord installed! Restarting Discord...");
                restartDiscord();
            });
        });
    }).on("error", (err) => {
        event.reply("install-error", "Download failed: " + err.message);
    });
});

// Uninstall Devcord
ipcMain.on("uninstall-mod", (event) => {
    const installPath = path.join(process.env.APPDATA || process.env.HOME, "Devcord", "devcord.asar");

    if (fs.existsSync(installPath)) {
        fs.unlinkSync(installPath);
        event.reply("install-complete", "Devcord uninstalled! Restarting Discord...");
        restartDiscord();
    } else {
        event.reply("install-error", "Devcord is not installed.");
    }
});

// Restart Discord Function
function restartDiscord() {
    exec("taskkill /IM Discord.exe /F", () => {
        setTimeout(() => exec("start discord"), 3000);
    });
}
