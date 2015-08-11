import PNGEncoder from 'png-stream/encoder';
import concat from 'concat-stream';
import { createReadStream } from 'streamifier';

export function makeBuffer(data) {
	let i;
	try {
		const buf = new Buffer(data.length * 4);

		i = 0;
		for(const c of data) {
			buf.writeInt32BE(c, i*4);
			i++;
		}

		return buf;
	}
	catch(e) { console.log('Crash at', i); throw e; }
}

export async function encodePng({ width, height }, data) {
	data = makeBuffer(data);

	const pngData = await new Promise((resolve, reject) => {
		createReadStream(data)
		.pipe(new PNGEncoder(width, height, { colorSpace: 'rgba' }))
		.pipe(concat(resolve));
	});

	return pngData;
}


// electron specific
import nativeImage from 'native-image';

export async function encodeNativeImage(size, data) {
	const png = await encodePng(size, data);

	return nativeImage.createFromBuffer(png);
}
