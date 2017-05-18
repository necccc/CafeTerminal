const EventEmitter = require('events')

const Sensor = require('./Sensor')
const Relay = require('./Relay')

const EVENT_WARMUP_START = 'warmup-start'
const EVENT_WARMUP_FINISHED = 'warmup-finished'
const EVENT_BREW_START = 'brew-start'
const EVENT_BREW_FINISHED = 'brew-finished'
const EVENT_BREW_PROGRESS = 'brew-progress'

const WARM_TRESHOLD = 40
const DEFAULT_BREW_TIME = 25

class CoffeeMaker extends EventEmitter {

    constructor () {
        super() // invoke the constructor of the superclass EventEmitter

        // set basic state
        this.state = {
            warm: false,
            brewing: false,
            active: false,
            warmlevel: 0
        }

        this.sensor = new Sensor({ port: 'A' })
        this.sensor.on(Sensor.events.HIGH, () => this.onWarm())
        this.sensor.on(Sensor.events.LOW, () => this.onCold())

        this.relay = new Relay({ port: 'B' })

    }

    start (brewTime = DEFAULT_BREW_TIME) {
        if (this.state.active) return; // already working, do nothing now

        this.state.active = true // set proper state
        this.brewTime = brewTime // store the received brew time parameter

        this.powerOn() // flip the power-on switch
    }

    powerOn () {
        this.relay.powerOn(1)

        if (this.state.warm) return // already warm

        this.emit(EVENT_WARMUP_START)
    }

    powerOff () {
        this.relay.powerOff(1)
        this.relay.powerOff(2)

        clearInterval(this.state.brewRegister)

        // reset state
        this.state.active = false
        this.state.warm = false
        this.state.brewing = false
        this.state.warmlevel = 0
    }

    brewStart () {
        this.relay.powerOn(2) // power on the pump

        this.emit(EVENT_BREW_START)

        this.state.brewing = true

        // start notifying the client of the brew progress
        this.state.brewRegister = setInterval(() => this.brewProgress(), 1000)
    }

    brewProgress () {
        this.brewTime -= 1
        if (this.brewTime === 0) {
            return this.brewStop()
        }

        this.emit(EVENT_BREW_PROGRESS)
    }

    brewStop () {
        clearInterval(this.state.brewRegister)

        this.relay.powerOff(2)

        this.emit(EVENT_BREW_FINISHED)

        this.state.brewing = false
        this.powerOff()
    }

    onWarm () {
        if (!this.state.active) return
        if (this.state.warm) return

        this.state.warm = true
        this.emit(EVENT_WARMUP_FINISHED);
    }

    onCold () {
        this.state.warm = false
    }

}

CoffeeMaker.events = {
    EVENT_WARMUP_START,
    EVENT_WARMUP_FINISHED,
    EVENT_BREW_START,
    EVENT_BREW_FINISHED,
    EVENT_BREW_PROGRESS
}

module.exports = CoffeeMaker