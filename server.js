"use strict";

const port = process.env.CHAT_PORT || 1337;
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

app.use((req, res) => {
    console.log(`HTTP request on ${req.url}`);
    res.json({
        msg: "hello"
    });
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

            if (data.hasOwnProperty("nick")) {
                let msg = {
                    timestamp: Date(),
                    nick: data.nick,
                    message: data.message
                };
                client.send(JSON.stringify(msg));
            }
            let msg = {
                timestamp: Date(),
                data
            };


            console.log(msg);
            return;

            client.send(JSON.stringify(msg));

            // if (ws.protocol === "json") {
            //     let msg = {
            //         timestamp: Date(),
            //         data
            //     };
            //     if (data.nick) {
            //         msg.nick = nick;
            //     }
            //     client.send(JSON.stringify(msg));
            // } else {
            //     client.send(data);
            // }
        }
    });
    console.log(`Broadcasted data to ${clients} (${wss.clients.size}) clients.`);
}



wss.on("connection", (ws) => {
    console.log("Connection received. Adding client.");
    broadcastExcept(ws, `New client connected (${wss.clients.size}) using '${ws.protocol}'.`);




    ws.on("message", (dataString) => {

        let data = JSON.parse(dataString);

        // console.log("DATA", data);
        // return;
        // console.log(`Received message from ${data.nick}: ${data.message}`);
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
