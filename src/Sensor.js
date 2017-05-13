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
const LIGHT_TRIGGER = 0.038

const HIGH = 'high'
const LOW = 'low'

class Sensor extends EventEmitter {

    constructor ({ port = 'A', debug = false, interval = INTERVAL} = {}) {
        super()

        this.interval = interval
        this.port = port.toUpperCase()
        this.debug = debug;

// ambient.setLightTrigger( triggerVal, callback(err, triggerVal) )
// Sets a trigger to emit a 'light-trigger' event when triggerVal is reached. triggerVal is a float between 0 and 1.0.
// # ambient.on( 'light-trigger', callback(lightTriggerValue) )


        if (ambientlib) {
            // Connect to our ambient sensor.
            this.ambient = ambientlib.use(tessel.port[this.port])
            this.ambient.on('ready', () => this.onReady())
            this.ambient.on('light-trigger', (value) => {
                console.log('light-trigger')
                this.emit(HIGH, value)
            })
        } else {
            setInterval(() => this.checkLevel_emulated(), this.interval)
        }
    }

    onReady () {

        console.log('ready')

        this.ambient.setLightTrigger(LIGHT_TRIGGER, (err, value) => {
            console.log('setLightTrigger', err, value)
        })
    }

    checkLevel () {
        this.ambient.getLightLevel((err, lightdata) => {
            if (err) throw err;

            let level = lightdata.toFixed(8)
            let diff = 0

            if (!this.level) {
                // store the first measurement
                this.level = level
            } else {
                // difference between the last measurement and the current one
                diff = (level - this.level) * 1000
            }

            // save the current measured value
            this.level = level

            if (this.debug) {
                console.log(Math.round(diff))
            }

            // Check if the difference between the last measurement
            // is large enough in a direction (up or down).
            // If so, emit the correct event

            if (diff >= LEVEL_TRESHOLD) {
                console.log('----[ HIGH ]---------------')
                this.emit(HIGH)
            }

            if (diff <= LEVEL_TRESHOLD * -1) {
                console.log('----[ LOW ]---------------')
                this.emit(LOW)
            }
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