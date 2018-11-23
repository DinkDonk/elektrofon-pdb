// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs');

const videoSelect = document.querySelector('#video-source');
const video = document.createElement('video');
const canvasElement = document.getElementById('canvas');
const canvas = canvasElement.getContext('2d');
const outputContainer = document.getElementById('output');
const outputData = document.getElementById('output-data');
const scanButton = document.querySelector('.btn-scan');
let tickId;
let scanPaused = false;

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

		M.FormSelect.init(document.querySelectorAll('select'));
	} else {
		videoSelect.value = devices[0].deviceId;

		getStream(null, true);
	}
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
	document.querySelector('#video-select-wrapper').hidden = true;
	document.querySelector('#video-wrapper').hidden = false;

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
	scanButton.hidden = true;
	outputContainer.hidden = true;
}

function tick() {
	if (video.readyState === video.HAVE_ENOUGH_DATA && !scanPaused) {
		canvasElement.hidden = false;
		outputContainer.hidden = false;

		canvasElement.height = video.videoHeight;
		canvasElement.width = video.videoWidth;
		canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

		const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
		const code = jsQR(imageData.data, imageData.width, imageData.height, {
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
			scanButton.hidden = false;

			let modal = window.open('', 'modal');
			modal.document.write(fs.readFileSync(`pdb/${code.data.substr(code.data.lastIndexOf('/') + 1)}.json`, 'utf8'));
		} else {
			outputContainer.hidden = true;
		}
	}

	tickId = requestAnimationFrame(tick);
}

videoSelect.onchange = getStream;