const EventEmitter = require('events')

const EVENT_WARMUP_START = 'warmup-start'
const EVENT_WARMUP_FINISHED = 'warmup-finished'
const EVENT_BREW_START = 'brew-start'
const EVENT_BREW_FINISHED = 'brew-finished'
const EVENT_BREW_PROGRESS = 'brew-progress'

const WARM_TRESHOLD = 40
const BREW_TIME = 15

class CoffeeMaker extends EventEmitter {

    constructor () {
        super()

        this.state = {
            warm: false,
            brewing: false,
            active: false,
            warmlevel: 0
        }

//        this.on(EVENT_WARMUP_START)
        this.on(EVENT_WARMUP_FINISHED, () => {
            this.state.warm = true
            setTimeout(() => this.brewStart(), 0)
        })

        setInterval(() => this.checkWarming(), 1000)

    }

    start (brewTime = BREW_TIME) {
        if (this.state.active) return; // already working

        this.state.active = true
        this.brewTime = brewTime

        this.powerOn()
    }

    powerOn () {
        console.log('tell t2 relay to activate A')

        if (this.state.warm) return // already warm

        this.emit(EVENT_WARMUP_START)
    }

    powerOff () {
        console.log('tell t2 relay to deactivate A')
        console.log('tell t2 relay to deactivate B')

        clearInterval(this.state.brewRegister)

        this.state.active = false
        this.state.warm = false
        this.state.brewing = false
        this.state.warmlevel = 0
    }

    brewStart () {
        console.log('tell t2 relay to activate B')

        this.emit(EVENT_BREW_START)

        this.state.brewing = true

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
        console.log('tell t2 relay to deactivate B')

        this.emit(EVENT_BREW_FINISHED)

        this.state.brewing = false
        this.powerOff()
    }

    checkWarming () {

        let lightlevel = 0

// mock
if (this.state.active && !this.state.warm) {
    lightlevel = this.state.warmlevel + 5;
}
//console.log(lightlevel, this.state.warmlevel)
// mock

        if (!this.state.warm && lightlevel > WARM_TRESHOLD) {
            return this.emit(EVENT_WARMUP_FINISHED);
        }

        this.state.warmlevel = lightlevel
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