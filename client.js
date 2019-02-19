"use strict";

(function() {
    let websocket;
    // let url = document.getElementById("connect_url");
    // let protocol = document.getElementById("protocol");

    let url = "ws://localhost:1337";
    let connect = document.getElementById("connect");
    let message = document.getElementById("message");
    let send = document.getElementById("send");
    let output = document.getElementById("output");
    let close = document.getElementById("close");
    let nick = document.getElementById("nick");



    function outputLog(data) {
        let now = new Date();
        let timestamp = now.toLocaleTimeString();


        if (data.hasOwnProperty("nick")) {
            console.log("MEDDELANDE");
            output.innerHTML += `<div class="message">
                <div class="timeStamp">${timestamp}</div>
                <div class="nick">${data.nick}</div>
                <div class="text">${data.message}</div>
            </div>`;
        } else {
            output.innerHTML += `<div class="message">
                <div class="timeStamp">${timestamp}</div>
                <div class="text">${data}</div>
            </div>`;
        }


        output.scrollTop = output.scrollHeight;
    }


    connect.addEventListener("click", () => {
        if (!nick.value) {
            console.log("You need to enter a nickname!");
            return;
        }
        connect.hidden = true;
        close.hidden = false;

        console.log(`${nick.value} is connecting to: ${url}`);

        // if (!protocol.value) {
        //     websocket = new WebSocket(url.value);
        // } else {
        //     websocket = new WebSocket(url.value, (function() {return protocol.value}()));
        // }

        websocket = new WebSocket(url, "json");



        websocket.onopen = function() {
            console.log(`The websocket is now open using ${websocket.protocol}.`);
            // console.log(websocket);
            // outputLog("The websocket is now open using '" + websocket.protocol + "'.");
            outputLog(`You connected as ${nick.value}!`)
        }

        websocket.onmessage = function(event) {


            let data = JSON.parse(event.data);
            outputLog(data)
            //
            // outputLog("Received message");
            // return;
            //
            //
            // console.log("LALALLA", data);
            // console.log("Receiving message: " + event.data);
            // console.log(event);
            // console.log(websocket);
            // outputLog("Server said: " + event.data);
            //
            //
            //
            // outputLog(`${data.nick}: ${data.message}`);
        }


        websocket.onclose = function() {
            console.log("The websocket is now closed.");
            console.log(websocket);
            outputLog("Websocket is now closed.");
        };

    }, false)



    send.addEventListener("click", () => {

        if (!message.value) {
            return console.log("You need to enter a message!");
        }
        let messageText = message.value;
        let nickText = nick.value;

        if (!websocket || websocket.readyState === 3) {
            console.log("The websocket is not connected to a server.");
        } else {
            let data = {
                nick: nickText,
                message: messageText
            };
            websocket.send(JSON.stringify(data));
            console.log("Sending message: " + messageText);
            outputLog("You said: " + messageText);
        }
        message.value = null;
    })


    close.addEventListener("click", () => {
        close.hidden = true;
        connect.hidden = false;

        // console.log("Closing websocket.");
        let data = {
            message: "Client closing connection by intention."
        };
        // websocket.send(JSON.stringify(data));
        websocket.close();
        // console.log(websocket);
        outputLog("Prepare to close websocket.");
    })
}());
