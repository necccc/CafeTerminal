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

const HIGH = 'high'
const LOW = 'low'

class Sensor extends EventEmitter {

    constructor (options) {
        super()

        let sensor_interval = INTERVAL

        if (options && options.debug) this.debug = true;

        if (options && options.interval) sensor_interval = options.interval;

        if (ambientlib) {
            // Connect to our ambient sensor.
            this.ambient = ambientlib.use(tessel.port['A'])

            // start checking levels
            setInterval(() => this.checkLevel(), sensor_interval)
        } else {
            setInterval(() => this.checkLevel_emulated(), sensor_interval)
        }
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

            if (diff > LEVEL_TRESHOLD) {
                console.log('----[ HIGH ]---------------')
                this.emit(HIGH)
            }

            if (diff < LEVEL_TRESHOLD * -1) {
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