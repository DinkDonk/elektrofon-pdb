// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs');
const serialize = require('form-serialize');

const videoSelectWrapper = document.querySelector('#video-select-wrapper');
const videoWrapper = document.querySelector('#video-wrapper');
const videoSelect = document.querySelector('#video-source');
const video = document.createElement('video');
const canvasElement = document.querySelector('canvas');
const canvas = canvasElement.getContext('2d');
const outputContainer = document.querySelector('#output');
const outputData = document.querySelector('#output-data');
const selectEventWrapper = document.querySelector('#select-event-wrapper');
const eventSelect = document.querySelector('#event-source');
const formWrapper = document.querySelector('#form-wrapper');
const form = document.querySelector('form');

let tickId;
let scanPaused = false;
let code;

navigator.mediaDevices.enumerateDevices()
.then((devices) => {
	let index = 1;

	devices = devices.filter((device) => {
		return device.kind === 'videoinput';
	});

	if (devices.length > 1) {
		devices.forEach((device) => {
			const option = document.createElement('option');
			option.value = device.deviceId;
			option.text = 'Camera ' + index;

			videoSelect.appendChild(option);

			index++;
		});

		videoSelectWrapper.hidden = false;
	} else {
		videoSelect.value = devices[0].deviceId;

		getStream(null, true);
	}

	M.FormSelect.init(document.querySelectorAll('select'));
})
.catch((err) => {
	console.log(`${err.name}: ${err.message}`);
});

function drawLine(begin, end, color) {
	canvas.beginPath();
	canvas.moveTo(begin.x, begin.y);
	canvas.lineTo(end.x, end.y);
	canvas.lineWidth = 4;
	canvas.strokeStyle = color;
	canvas.stroke();
}

function getStream(event, ignoreSelect) {
	videoSelectWrapper.hidden = true;
	videoWrapper.hidden = false;

	const options = {
		audio: false,
		video: {
			facingMode: 'environment',
			width: 640,
			height: 640,
			frameRate: {
				ideal: 25,
				min: 10
			}
		}
	};

	if (!ignoreSelect) {
		options.video.deviceId = {exact: videoSelect.value};
	}

	let stream = navigator.mediaDevices.getUserMedia(options).then((stream) => {
		video.srcObject = stream;
		video.setAttribute('playsinline', true); // Required to tell iOS safari we don't want fullscreen
		video.play();

		tickId = requestAnimationFrame(tick);
	});
}

function startScan() {
	scanPaused = false;
	outputContainer.hidden = true;
}

function tick() {
	if (video.readyState === video.HAVE_ENOUGH_DATA && !scanPaused) {
		canvasElement.hidden = false;
		outputContainer.hidden = false;

		// canvasElement.height = video.videoHeight;
		// canvasElement.width = video.videoWidth;
		canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

		const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
		code = jsQR(imageData.data, imageData.width, imageData.height, {
			inversionAttempts: 'dontInvert',
		});

		if (code) {
			drawLine(code.location.topLeftCorner, code.location.topRightCorner, '#FF3B58');
			drawLine(code.location.topRightCorner, code.location.bottomRightCorner, '#FF3B58');
			drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, '#FF3B58');
			drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, '#FF3B58');

			outputContainer.hidden = false;
			outputData.innerText = code.data;

			scanPaused = true;

			videoSelectWrapper.hidden = true;
			selectEventWrapper.hidden = false;
		} else {
			outputContainer.hidden = true;
		}
	}

	tickId = requestAnimationFrame(tick);
}

function reset() {
	formWrapper.hidden = true;
	selectEventWrapper.hidden = true;
	videoWrapper.hidden = false;

	startScan();

	eventSelect.selectedIndex = -1;
	M.FormSelect.init(eventSelect);
}

window.cancelForm = reset;

window.sendForm = () => {
	eventSelect.selectedIndex = -1;
	M.FormSelect.init(eventSelect);

	const serial = code.data.substr(code.data.lastIndexOf('/') + 1);

	item = JSON.parse(fs.readFileSync(`pdb/${code.data.substr(code.data.lastIndexOf('/') + 1)}.json`, 'utf8'));

	if (!item.hasOwnProperty('events')) {
		item.events = [];
	}

	item.events.push({
		name: eventSelect.text,
		time: new Date().toISOString(),
		data: serialize(form, {hash: true})
	});

	console.log(serialize(form, {hash: true}));

	fs.writeFileSync(`pdb/${code.data.substr(code.data.lastIndexOf('/') + 1)}.json`, JSON.stringify(item));

	reset();
};

function getForm() {
	let formContent = '';

	switch (eventSelect.value) {
		case 'pcb-received':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<input id="manufacturer" name="manufacturer" type="text" class="validate">
						<label for="manufacturer">Manufacturer</label>
					</div>
				</div>
				<div class="row">
					<div class="input-field col s12">
						<textarea id="notes" name="notes" class="materialize-textarea"></textarea>
						<label for="notes">Notes</label>
					</div>
				</div>
			`;
		break;
		case 'pcb-inspected':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="inspector" name="inspector">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="inspector">Inspector</label>
					</div>
				</div>
			`;
		break;
		case 'pick-and-place-completed':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="technician" name="technician">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="technician">Technician</label>
					</div>
				</div>
			`;
		break;
		case 'reflow-completed':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="technician" name="technician">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="technician">Technician</label>
					</div>
				</div>
			`;
		break;
		case 'manual-soldering-completed':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="technician" name="technician">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="technician">Technician</label>
					</div>
				</div>
				<div class="row">
					<div class="input-field col s12">
						<textarea id="notes" name="notes" class="materialize-textarea"></textarea>
						<label for="notes">Notes</label>
					</div>
				</div>
			`;
		break;
		case 'power-on-test-completed':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="technician" name="technician">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="technician">Technician</label>
					</div>
				</div>
				<div class="row">
					<div class="input-field col s12">
						<textarea id="notes" name="notes" class="materialize-textarea"></textarea>
						<label for="notes">Notes</label>
					</div>
				</div>
			`;
		break;
		case 'programming-completed':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="technician" name="technician">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="technician">Technician</label>
					</div>
				</div>
			`;
		break;
		case 'calibration-completed':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="technician" name="technician">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="technician">Technician</label>
					</div>
				</div>
				<div class="row">
					<div class="input-field col s12">
						<textarea id="notes" name="notes" class="materialize-textarea"></textarea>
						<label for="notes">Notes</label>
					</div>
				</div>
			`;
		break;
		case 'ultrasonic-cleaning-completed':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="technician" name="technician">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="technician">Technician</label>
					</div>
				</div>
			`;
		break;
		case 'assembly-completed':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="technician" name="technician">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="technician">Technician</label>
					</div>
				</div>
			`;
		break;
		case 'packing-completed':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="technician" name="technician">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="technician">Technician</label>
					</div>
				</div>
			`;
		break;
		case 'shipped':
			formContent = `
				<div class="row">
					<div class="input-field col s12">
						<select id="technician" name="technician">
							<option value="Rune Warhuus" selected>Rune Warhuus</option>
							<option value="Erlend Sand Bærland">Erlend Sand Bærland</option>
							<option value="Otto A. Totland">Otto A. Totland</option>
						</select>
						<label for="technician">Technician</label>
					</div>
				</div>
				<div class="row">
					<div class="input-field col s12">
						<select id="courier" name="courier">
							<option value="DHL" selected>DHL</option>
							<option value="FedEx">FedEx</option>
							<option value="UPS">UPS</option>
						</select>
						<label for="courier">Courier</label>
					</div>
				</div>
				<div class="row">
					<div class="input-field col s12">
						<input id="tracking-number" name="tracking-number" type="text" class="validate">
						<label for="tracking-number">Tracking number</label>
					</div>
				</div>
			`;
		break;
	}

	formContent += `
		<div class="row">
			<a class="waves-effect waves-light btn-large red" onclick="cancelForm()">Cancel</a>
			<a class="waves-effect waves-light btn-large" onclick="sendForm()">OK</a>
		</div>
	`;

	form.innerHTML = formContent;

	M.FormSelect.init(form.querySelectorAll('select'));

	videoWrapper.hidden = true;
	selectEventWrapper.hidden = true;
	formWrapper.hidden = false;
}

videoSelect.onchange = getStream;
eventSelect.onchange = getForm;