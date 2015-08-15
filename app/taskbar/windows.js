import stream from 'stream';

import x11 from 'x11';
import * as x11PropStream from 'x11-prop-stream';
import X11IconTransform from 'x11-icon-transform';

import through2 from 'through2';
import PNGEncoder from 'png-stream/encoder';
import { createReadStream } from 'streamifier';
import concat from 'concat-stream';

import _ from 'lodash';
import { exec } from 'child_process';
import Parser from 'simple-text-parser';
import Q from 'q';

const hintsParser = new Parser();

hintsParser.addRule(/displayed on desktop \d+/ig, (match) => {
    const [full, value] = match.match(/displayed on desktop (\d+)/i);
    return { type: 'desktopId', value };
});

hintsParser.addRule(/window type:\n\s+\w+/img, (match) => {
    const [full, value] = match.match(/window type:\n\s+(\w+)/im);
    return { type: 'windowType', value };
});

function parse(txt, parser) {
    _(txt)
    .thru((txt) => parser.toTree(txt))
    .filter((n) => n.type !== 'text')
    .reduce((acc, curr) => acc[curr.type] = acc.value, {})
    .value();
}

function parseList(txt) {
    const lines =
        txt
        .split('\n')
        .map((line) =>
            line.match(/^(0x[a-f0-9]+)\s+(\-?\d+)\s+(\S+)\s+(.+)$/)
        )
        .filter(_.identity)
        .map((match) => Array.from(match).slice(1))
        .map(([id, desktopId, host, title]) => {
            return { id, desktopId, host, title };
        });

    return lines;
}

export async function list() {
    const [out] = await Q.nfcall(exec, `wmctrl -l`);

    const list = parseList(out);

    return list;
}

export async function hints(wid) {
    const [out] = await Q.nfcall(exec, `xwininfo -wm -id ${wid}`);

    return parse(out, hintsParser);
}

export async function icon(wid) {
    const display = await Q.ninvoke(x11, 'createClient');
    const X = display.client;

    const _NET_WM_ICON = await Q.ninvoke(X, 'InternAtom', false, '_NET_WM_ICON');

    const imgs = await new Promise((resolve, reject) => {
        new x11PropStream.Readable(X, Number(wid), _NET_WM_ICON, X.atoms.CARDINAL)
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
