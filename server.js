const express = require('express');
const fs = require('fs');


const app = express();

const PORT = 3000 | process.env.PORT;
const HOST = 'localhost';

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/index.html");
})

app.get('/video', (req, res) => {
	const range = req.headers.range;	// Get position in the video stream
	if (!range) {
		res.status(400).send('Requires Range Header');
	}

	const videoPath = './clip.mp4';
	const videoSize = fs.statSync(videoPath).size;

	const CHUNK_SIZE = 1 * 1e+6; // 1 MB streaming rate
	const start = Number(range.replace(/\D/g, '')); // Remove non digits from range headers. Range ex.: "bytes=32230-" => 32230
	const end = Math.min(start + CHUNK_SIZE, videoSize - 1); // Takes the next batch or the totality for the last stream

	const contentLength = end - start + 1;

	const headers = {
		"Content-range": `bytes ${start}-${end}/${videoSize}`,
		"Accept-Ranges": "bytes",
		"Content-Length": contentLength,
		"Content-Type": "video/mp4"
	}

	res.writeHead(206, headers) // 206 = Partial Content, so the video element streams
	const videoStream = fs.createReadStream(videoPath, { start, end }); // Read the video file, from this part (start) to this one (end)
	videoStream.pipe(res);
});

app.listen(PORT, HOST);