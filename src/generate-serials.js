const fs = require('fs');
const config = require('../config/config.json');
const args = require('minimist')(process.argv.slice(2));

if (!fs.existsSync(__dirname + '/../pdb')){
	fs.mkdirSync(__dirname + '/../pdb');
}

let serials = fs.readFileSync(__dirname + '/../serials/serials.list', 'utf8').split('\n');
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

		fs.appendFileSync(__dirname + '/../serials/serials.list', serial + '\n');

		fs.writeFileSync(`${__dirname}/../pdb/${serial}.json`, `{"serial": "${serial}", "identifier": "${identifierMatch[0].identifier}"}`);
	}
}

if (args._.length < 1) {
	generateSerials('klang', 1);
} else if (args._.length < 2) {
	generateSerials(args._[0], 1);
} else {
	generateSerials(args._[0], args._[1]);
}