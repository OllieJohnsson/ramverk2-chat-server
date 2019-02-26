"use strict";

const port = process.env.CHAT_PORT || 1338;
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({
    server,
    clientTracking: true,
    handleProtocols
});


const db = require("./db");


// Return a JSON object with list of all documents within the collection.
app.get("/list", async (request, response) => {
    try {
        let res = await db.findInCollection("log", {}, {}, 0);

        console.log(res);
        response.json(res);
    } catch (err) {
        console.log(err);
        response.json(err);
    }
});

app.use((req, res) => {
    console.log(`HTTP request on ${req.url}`);
    res.end("Hello!");
});

function handleProtocols(protocols) {
    console.log(`Incoming protocol requests '${protocols}'.`);
    for (var i = 0; i < protocols.length; i++) {
        if (protocols[i] === "text") {
            return "text";
        } else if (protocols[i] === "json") {
            return "json";
        }
    }
    return false;
}



function broadcastExcept(ws, data) {
    let clients = 0;

    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            clients++;

            let msg = {
                timestamp: Date(),
                nickname: data.nickname,
                message: data.message
            };

            client.send(JSON.stringify(msg));
        }
    });
    console.log(`Broadcasted data to ${clients} (${wss.clients.size}) clients.`);
}



wss.on("connection", (ws) => {
    console.log("Connection received. Adding client.");
    let data = {
        message: `New client connected (${wss.clients.size}) using '${ws.protocol}'.`
    };
    broadcastExcept(ws, data);


    ws.on("message", (dataString) => {

        let data = JSON.parse(dataString);

        if (data.type === "save") {
            console.log("Save log");
            db.saveToCollection(data.nickname, JSON.parse(data.log));
            return;
        }

        if (data.type === "load") {
            console.log("Going to load db");

            let res = db.findInCollection(data.nickname, {}, {}, 0).then(log => {
                let data = {
                    type: "log",
                    log: log
                };
                ws.send(JSON.stringify(data))
            });
            return;
        }

        broadcastExcept(ws, data);
    });



    ws.on("error", (error) => {
        console.log(`Server error: ${error}`);
    });




    ws.on("close", (code, reason) => {
        console.log(`Closing connection: ${code} ${reason}`);
        broadcastExcept(ws, `Client disconnected (${wss.clients.size}).`);
    });
})


server.listen(port, () => {
    console.log(`Listening to port ${port}`);
})
