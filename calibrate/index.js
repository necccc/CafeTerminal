
// run ws client connect to host
// handle relay on/off
// start measure sensor & put to console
// 

const WebSocket = require('ws');

const Relay = require('./Relay');
const Sensor = require('./Sensor');

const ws = new WebSocket('ws://127.0.0.1:8080', {
  perMessageDeflate: false
});

const sensor = new Sensor()
const relay = new Relay()

ws.on('message', (data, flags) => {

    var d = JSON.parse(data)
    console.log(d)

    if (d.toggle) {
        relay.powerOn(1)
    } else [
        relay.powerOff(1)
    ]
})

