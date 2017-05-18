const EventEmitter = require('events')


var tessel = null
var ambientlib = null

// can be used on local desktop without the tessel hardware
// just set the NODE_NOT_TESSEL enviroment variable to some truthy value
if (!process.env.NODE_NOT_TESSEL) {
    tessel = require('tessel');
    ambientlib = require('ambient-attx4');
}

const INTERVAL = 100
const LEVEL_TRESHOLD = 6
const LIGHT_TRIGGER = 0.04

const HIGH = 'high'
const LOW = 'low'

class Sensor extends EventEmitter {

    constructor ({ port = 'A', debug = false, interval = INTERVAL} = {}) {
        super()

        this.interval = interval
        this.port = port.toUpperCase()
        this.debug = debug;

        if (ambientlib) {
            // Connect to our ambient sensor.
            this.ambient = ambientlib.use(tessel.port[this.port])
            this.ambient.on('ready', () => this.onReady())
            this.ambient.on('light-trigger', (value) => this.emit(HIGH, value)) // listen for the event of the light turning on
        } else {
            setInterval(() => this.checkLevel_emulated(), this.interval)
        }
    }

    onReady () {
        // when ready, set the light trigger level
        this.ambient.setLightTrigger(LIGHT_TRIGGER, (err, value) => {
            console.log('setLightTrigger', err, value)
        })
    }

    checkLevel_emulated () {
        let rand = Math.floor(Math.random() * (100 - 1 + 1)) + 1;

        if (rand > 80) {
            this.emit(HIGH)
        }

        if (rand < 20) {
            this.emit(LOW)
        }
    }
}

Sensor.events = {
    HIGH,
    LOW
}

module.exports = Sensor