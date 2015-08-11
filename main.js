import path from 'path';

import app from 'app';
import BrowserWindow from 'browser-window';
import crashReporter from 'crash-reporter';

crashReporter.start();

let mainWindow = null;

app.on('window-all-closed', function() {
    app.quit();
});

app.on('ready', () => {
    const screen = require('screen');

    console.log(screen.getPrimaryDisplay());

    const display = screen.getPrimaryDisplay();

    mainWindow = new BrowserWindow({
        x: display.workArea.x,
        width: display.workArea.width, height: 300,
        frame: true
    });

    mainWindow.loadUrl(`file://${__dirname}/app/index.html`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
