const EventEmitter = require('events')

var tessel = null
var relaylib = null

// can be used on local desktop without the tessel hardware
// just set the NODE_NOT_TESSEL enviroment variable to some truthy value
if (!process.env.NODE_NOT_TESSEL) {
    tessel = require('tessel');
    relaylib = require('relay-mono');
}

class Relay extends EventEmitter {

    constructor () {
        super()

        if (relaylib) {
            // Connect to relay module
            this.relay = relaylib.use(tessel.port['B'])

            // Set ready state if available
            this.relay.on('ready', () => { this.ready = true })
            this.relay.on('error', (err) => { console.log(err) })
        }
    }

    powerOn (index) {
        console.log('Relay to power on ' + index)

        if (!this.relay) return;
        if (!this.ready) return;

        // if relay 2 is on:
        // DO NOT TURN ON THE 1ST ONE
        // seems like it creates a power surge in the Coffee Machine, 
        // that fries the relay 
        if (index === 1) {
            this.relay.getState(2, (err, state) => {
                if (!state) {
                    this.relay.turnOn(index, () => {})
                } else {
                    console.log('Relay 2 is on - skipping 1 to protect the relay')
                }
            })
        } else {
            this.relay.turnOn(index, () => {})
        }
    }

    powerOff (index) {
        console.log('Relay to power off ' + index)

        if (!this.relay) return;
        if (!this.ready) return;

        this.relay.turnOff(index, () => {})
    }
}

module.exports = Relay