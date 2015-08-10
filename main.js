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
    mainWindow = new BrowserWindow({ width: 800, height: 600 });

    mainWindow.loadUrl(`file://${__dirname}/app/index.html`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
