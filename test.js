import concat from 'concat-stream';
import { createReadStream } from 'streamifier';

const tmpBuf = new Buffer(4);

function processData(data) {
	tmpBuf.writeUInt32BE(data); // write as ARGB

	return (
		tmpBuf.readUInt8(0) |
		(tmpBuf.readUInt8(3) << 24) |
		(tmpBuf.readUInt8(2) << 16) |
		(tmpBuf.readUInt8(1) << 8)
	);
}

process.stdin
.pipe(concat((data) => {
	data = data.toString().split('\n').filter((s) => s.length).map(Number);

	const [width, height] = data;
	data = data.slice(2).slice(0, width*height).map(processData);

	console.log(JSON.stringify({width, height, data}));
}));
