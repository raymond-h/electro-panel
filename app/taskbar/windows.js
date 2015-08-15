import stream from 'stream';

import x11 from 'x11';
import * as x11PropStream from 'x11-prop-stream';
import X11IconTransform from 'x11-icon-transform';

import through2 from 'through2';
import PNGEncoder from 'png-stream/encoder';
import { createReadStream } from 'streamifier';
import concat from 'concat-stream';

import _ from 'lodash';
import Q from 'q';

export async function x11Context(fn) {
    const display = await Q.ninvoke(x11, 'createClient');
    const X = display.client;

    const ret = await fn(display, X);

    await Q.ninvoke(X, 'close');

    return ret;
}

export async function getProperty(X, wid, name, type) {
    const tmp = await Q.ninvoke(X, 'GetProperty', 0, wid, name, type, 0, 0);

    if(tmp.type !== type) return null;

    const data = await new Promise((resolve, reject) => {
        new x11PropStream.Readable(X, wid, name, type)
            .pipe(concat(resolve))
            .on('error', reject);
    });

    return data;
}

export function listIds() {
    return x11Context(async (display, X) => {
        const root = display.screen[0].root;

        const _NET_CLIENT_LIST = await Q.ninvoke(X, 'InternAtom', false, '_NET_CLIENT_LIST');
        const WINDOW = await Q.ninvoke(X, 'InternAtom', false, 'WINDOW');

        const wins = await getProperty(X, root, _NET_CLIENT_LIST, WINDOW);

        const ids = [];
        for(let i = 0; i < wins.length; i+=4) {
            ids.push(wins.readUInt32LE(i));
        }

        console.log(ids);

        return ids;
    });
}

export function title(wid) {
    return x11Context(async (display, X) => {
        let name = await Q.ninvoke(
            X, 'GetProperty', 0, wid, X.atoms.WM_NAME, X.atoms.STRING, 0, 1000000
        );

        if(name.type !== X.atoms.STRING) {
            const UTF8_STRING = await Q.ninvoke(X, 'InternAtom', false, 'UTF8_STRING');

            name = await Q.ninvoke(
                X, 'GetProperty', 0, wid, X.atoms.WM_NAME, UTF8_STRING, 0, 1000000
            );
        }

        return name.data.toString();
    });
}

export function icon(wid) {
    return x11Context(async (display, X) => {
        const _NET_WM_ICON = await Q.ninvoke(X, 'InternAtom', false, '_NET_WM_ICON');

        const imgs = await new Promise((resolve, reject) => {
            new x11PropStream.Readable(X, wid, _NET_WM_ICON, X.atoms.CARDINAL)
                .pipe(new X11IconTransform)
                .pipe(concat(resolve))
                .on('error', reject);
        });

        const img = _.max(imgs, (img) => img.width * img.height);

        const png = await new Promise((resolve, reject) => {
            writeToPng(img)
            .pipe(concat(resolve))
            .on('error', reject);
        });

        return png;
    });
}

function writeToPng(img) {
    const { width, height, data } = img;

    return createReadStream(data)
    .pipe(through2(function(chunk, enc, cb) {
        let tmp;
        for(let i = 0; i < chunk.length; i+=4) {
            tmp = chunk[i];
            chunk[i] = chunk[i+2];
            chunk[i+2] = tmp;
        }
        cb(null, chunk);
    }))
    .pipe(new PNGEncoder(width, height, { colorSpace: 'rgba' }));
}
