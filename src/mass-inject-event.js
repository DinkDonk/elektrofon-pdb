const fs = require('fs');
const path = require('path');
const config = require('../config/config.json');
const args = require('minimist')(process.argv.slice(2));

let payload;

if (!args._[0]) {
	console.error('Error: A JSON payload is required');
	process.exit(0);
} else {
	try {
		payload = JSON.parse(args._[0]);
	} catch (error) {
		console.error('Error: Payload needs to be valid JSON');
		process.exit(0);
	}

	if (!payload.hasOwnProperty('name') || !payload.hasOwnProperty('time') || !payload.hasOwnProperty('data')) {
		console.error('Error: Payload needs to be an object containing "name", "time" and "data" properties');
		process.exit(0);
	}
}

fs.readdir(__dirname + '/../pdb', (error, filenames) => {
	if (error) throw error;

	filenames.forEach((filename) => {
		fs.readFile(__dirname + '/../pdb/' + filename, 'utf8', (error, data) => {
			if (error) throw error;

			if (path.extname(filename) === '.json') {
				let pdbItem = JSON.parse(data);

				if (!pdbItem.hasOwnProperty('events')) {
					pdbItem.events = [];
				}

				if (!Array.isArray(pdbItem.events)) {
					console.error('Error: Events is not an array');
					process.exit(0);
				}

				pdbItem.events.push(payload);

				fs.writeFileSync(__dirname + '/../pdb/' + filename, JSON.stringify(pdbItem), 'utf8');
			}
		});
	});
});