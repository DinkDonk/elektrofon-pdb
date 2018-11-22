const fs = require('fs');
const config = require('./config/config.json');

console.log(config);

let serials = fs.readFileSync('serials/serials.list', 'utf8').split('\n');
const newSerials = [];

if (serials[serials.length - 1] !== '') {
	fs.appendFileSync('serials/serials.list', '\n');
}

serials = serials.filter(Boolean);

function generateUniqueId() {
	const serial = (Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)).substring(0, 10);

	if (serials.indexOf(serial) === -1) {
		return serial;
	} else {
		generateUniqueId();
	}
}

function generateSerials(productIdentifier, count = 1) {
	let identifierMatch = config.products.filter((product) => product.identifier === productIdentifier);

	if (identifierMatch.length < 1) {
		return console.log('Identifier not found!');
	}

	for (let i = 0; i < count; i++) {
		const serial = generateUniqueId();

		newSerials.push(serial);

		fs.appendFileSync('serials/serials.list', serial + '\n');

		fs.writeFileSync(`pdb/${serial}.json`, `{"serial": "${serial}", "identifier": "${identifierMatch[0].identifier}"}`);
	}
}

function queryPdb(serial) {
	if (!fs.existsSync(`pdb/${serial}.json`)) {
		return console.log('Serial not found');
	}

	console.log(JSON.parse(fs.readFileSync(`pdb/${serial}.json`, 'utf8')));
}

generateSerials('klang', 4);

// console.log(newSerials);

// queryPdb('usee5kxtwq');