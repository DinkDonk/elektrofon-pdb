const fs = require('fs');
var QRCode = require("qrcode-svg");

const wrapperTemplate = fs.readFileSync(__dirname + '/templates/wrapper.html', 'utf8');
const eventTemplate = fs.readFileSync(__dirname + '/templates/event.html', 'utf8');

function generateHtml(item) {
	const qrcode = new QRCode({
		content: 'http://pdb.elektrofon.no/' + item.serial,
		padding: 4,
		width: 256,
		height: 256,
		color: '#000000',
		background: 'white',
		ecl: 'M'
	}).svg();

	let wrapperMarkup = wrapperTemplate
		.replace(/{{SERIAL_NUMBER}}/g, item.serial)
		.replace(/{{IDENTIFIER}}/g, item.identifier)
		.replace(/{{QRCODE}}/g, qrcode);

	if (item.hasOwnProperty('events')) {
		const eventMarkups = [];

		item.events.sort((a, b) => Date.parse(a.time) - Date.parse(b.time));

		item.events.forEach((event) => {
			let eventMarkup = eventTemplate
				.replace(/{{NAME}}/g, event.name)
				.replace(/{{TIME}}/g, event.time);

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

	fs.writeFileSync(`${__dirname}/../site/${item.serial}.html`, wrapperMarkup);
}

fs.readdir('pdb', (error, filenames) => {
	if (error) throw error;

	filenames.forEach((filename) => {
		fs.readFile('pdb/' + filename, 'utf8', (error, data) => {
			if (error) throw error;

			generateHtml(JSON.parse(data));
		});
	});
});