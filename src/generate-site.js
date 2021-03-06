const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode-svg');

const wrapperTemplate = fs.readFileSync(__dirname + '/templates/wrapper.html', 'utf8');
const eventTemplate = fs.readFileSync(__dirname + '/templates/event.html', 'utf8');

if (!fs.existsSync(__dirname + '/../site')){
	fs.mkdirSync(__dirname + '/../site');
}

function generateHtml(item) {
	const qrcode = new QRCode({
		content: 'http://pdb.elektrofon.no/' + item.serial,
		padding: 4,
		width: 256,
		height: 256,
		color: '#000000',
		background: 'white',
		ecl: 'M'
	})
	.svg()
	.replace(/<\?xml.*?\?>/, '')
	.replace(/<svg.*?>/, '')
	.replace(/<\/svg>/, '');

	let wrapperMarkup = wrapperTemplate
		.replace(/{{SERIAL_NUMBER}}/g, item.serial)
		.replace(/{{IDENTIFIER}}/g, item.identifier)
		.replace(/{{QRCODE}}/g, qrcode);

	if (item.hasOwnProperty('events')) {
		const eventMarkups = [];

		item.events.sort((a, b) => Date.parse(a.time) - Date.parse(b.time));

		item.events.forEach((event) => {
			let time = new Date(event.time);
			let eventMarkup = eventTemplate
				.replace(/{{NAME}}/g, event.name)
				.replace(/{{TIME}}/g, `${time.getFullYear()}-${('0' + (time.getMonth() + 1)).slice(-2)}-${('0' + time.getDate()).slice(-2)} ${('0' + time.getHours()).slice(-2)}:${('0' + time.getMinutes()).slice(-2)}`);

			if (event.hasOwnProperty('data')) {
				const dataItemMarkups = [];

				for (const [key, value] of Object.entries(event.data)) {
					dataItemMarkups.push(`<li class="collection-item">${key} <span class="secondary-content">${value}</span></li>`);
				}

				eventMarkup = eventMarkup.replace(/{{DATA}}/g, dataItemMarkups.join('\n'));
			}

			eventMarkups.push(eventMarkup);
		});

		wrapperMarkup = wrapperMarkup.replace(/{{EVENTS}}/g, eventMarkups.join('\n'));
	}

	if (!fs.existsSync(`${__dirname}/../site/${item.serial}`)){
		fs.mkdirSync(`${__dirname}/../site/${item.serial}`);
	}

	fs.writeFileSync(`${__dirname}/../site/${item.serial}/index.html`, wrapperMarkup);
}

fs.readdir(__dirname + '/../pdb', (error, filenames) => {
	if (error) throw error;

	filenames.forEach((filename) => {
		fs.readFile(__dirname + '/../pdb/' + filename, 'utf8', (error, data) => {
			if (error) throw error;

			if (path.extname(filename) === '.json') {
				generateHtml(JSON.parse(data));
			}
		});
	});
});