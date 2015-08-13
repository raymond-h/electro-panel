import _ from 'lodash';
import { exec } from 'child_process';
import Parser from 'simple-text-parser';
import Q from 'q';

import concat from 'concat-stream';

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
