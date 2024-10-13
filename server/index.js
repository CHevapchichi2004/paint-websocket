const express = require("express");
const app = express();
const WSServer = require("express-ws")(app);
const cors = require("cors");
const aWss = WSServer.getWss();
const fs = require("fs");
const path = require("path");

app.use(cors());
app.use(express.json());

app.ws("/", (ws, req) => {
	ws.on("message", (msg) => {
		const message = JSON.parse(msg);
		switch (message.method) {
			case "connection":
				broadcastConnection(ws, message);
				break;
			case "draw":
				broadcastConnection(ws, message);
				break;
		}
	});
});

app.get("/image", (req, res) => {
	try {
		const file = fs.readFileSync(
			path.resolve(__dirname, "files", `${req.query.id}.jpg`)
		);
		const data = "data:image/png;base64," + file.toString("base64");
		res.json(data);
	} catch (e) {
		console.log(e);
		res.status(500).json("AlARM!");
	}
});

app.post("/image", (req, res) => {
	try {
		console.log("yeeee");
		console.log(req.body.img.slice(0, 100));
		const data = req.body.img.replace("data:image/png;base64,", "");
		fs.writeFileSync(
			path.resolve(__dirname, "files", `${req.query.id}.jpg`),
			data,
			"base64"
		);

		return res.status(200).json();
	} catch (e) {
		console.log(e);
		res.status(500).json("AlARM!");
	}
});

app.listen(5000, () => console.log("successfull"));

function broadcastConnection(ws, msg) {
	ws.id = msg.id;
	aWss.clients.forEach((client) => {
		if (client.id === msg.id) {
			client.send(JSON.stringify(msg));
		}
	});
}
