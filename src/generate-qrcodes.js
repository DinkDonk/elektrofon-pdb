const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode-svg');
const config = require('../config/config.json');

if (!fs.existsSync(__dirname + '/../qrcodes')){
	fs.mkdirSync(__dirname + '/../qrcodes');
}

fs.readdir(__dirname + '/../pdb', (error, filenames) => {
	if (error) throw error;

	filenames.forEach((filename) => {
		fs.readFile(__dirname + '/../pdb/' + filename, 'utf8', (error, data) => {
			if (error) throw error;

			if (path.extname(filename) === '.json') {
				const item = JSON.parse(data);

				const itemConfig = config.products.filter((product) => product.identifier === item.identifier)[0];

				const qrcode = new QRCode({
					content: `http://pdb.elektrofon.no/${item.serial}`,
					padding: 0,
					width: itemConfig.qrcodeSize.width,
					height: itemConfig.qrcodeSize.height,
					color: '#0000FF',
					background: 'transparent',
					ecl: 'M'
				})
				.svg()
				.replace(/<\?xml.*?\?>/, '')
				.replace(/<svg.*?>/, '')
				.replace(/<\/svg>/, '');

				fs.writeFileSync(`${__dirname}/../qrcodes/${item.serial}.svg`, `
					<?xml version="1.0" standalone="yes"?>
					<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${itemConfig.pcbSize.width + config.laserOffset.x}" height="${itemConfig.pcbSize.height + config.laserOffset.y}">
						<svg x="${itemConfig.qrcodePosition.x}" y="${itemConfig.qrcodePosition.y}">
							${qrcode}
						</svg>
					</svg>
				`);
			}
		});
	});
});