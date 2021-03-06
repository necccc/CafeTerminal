
// run ws client connect to host
// handle relay on/off
// start measure sensor & put to console
// 

const WebSocket = require('ws');

const Relay = require('./Relay')
const Sensor = require('./Sensor')
const Network = require('./Network')

const net = new Network()

net.once(Network.events.READY, () => {

    console.log('network ready')

    const wss = new WebSocket.Server({ port: 8080 });

    const sensor = new Sensor({ port: 'A', debug: true, interval: 100 })

    sensor.on(Sensor.events.HIGH, (level) => {
        console.log('light HIGH', level)
    })

    const relay = new Relay({port: 'B'})

    wss.on('error', (err) => {
        console.log('WebSocket Server error')
        console.log(err)
        process.exit()
    });

    wss.on('connection', (ws) => {

        console.log('client connection')

        if (wss.clients.size > 1) {
            ws.close();
            return;
        }

        ws.on('message', (message) => {
            let d = JSON.parse(message)

            console.log(d)

            if (d.toggle) {
                relay.powerOn(d.port)
            } else [
                relay.powerOff(d.port)
            ]
        });

    })
})

net.create()

