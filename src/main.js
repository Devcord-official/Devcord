const { app, BrowserWindow, ipcMain } = require("electron");
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

// Discord's default installation path (for Windows)
const discordAppPath = path.join(process.env.APPDATA || process.env.HOME, "Discord", "app-<version>", "resources");
const originalAppPath = path.join(discordAppPath, "app.asar");
const devcordPath = path.join(__dirname, "devcord.asar"); // Path to the downloaded devcord.asar

// Install Devcord: Replace app.asar
ipcMain.on("install-mod", (event) => {
    // Ensure Discord’s `app.asar` exists
    if (fs.existsSync(originalAppPath)) {
        // Backup original app.asar
        fs.renameSync(originalAppPath, `${originalAppPath}.bak`);

        // Copy devcord.asar to replace app.asar
        fs.copyFileSync(devcordPath, originalAppPath);

        event.reply("install-complete", "Devcord installed! Restarting Discord...");
        restartDiscord();
    } else {
        event.reply("install-error", "Discord app.asar not found.");
    }
});

// Uninstall Devcord: Restore original app.asar
ipcMain.on("uninstall-mod", (event) => {
    if (fs.existsSync(`${originalAppPath}.bak`)) {
        // Restore original app.asar from backup
        fs.renameSync(`${originalAppPath}.bak`, originalAppPath);

        event.reply("install-complete", "Devcord uninstalled! Restarting Discord...");
        restartDiscord();
    } else {
        event.reply("install-error", "Devcord is not installed.");
    }
});

// Restart Discord Function
function restartDiscord() {
    // Close Discord
    exec("taskkill /IM Discord.exe /F", () => {
        // Wait 3 seconds and restart
        setTimeout(() => exec("start discord"), 3000);
    });
}
