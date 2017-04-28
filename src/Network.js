const EventEmitter = require('events');

const CONFIG = {
    ssid: 'CafeTerminal',
    password: 'qqwe321',
    security: 'none'
}

const READY = 'ready';
const ERROR = 'error';
const CREATE = 'create';
const DISCONNECT = 'disconnect';
const TIMEOUT = 'timeout';

class Network extends EventEmitter {

    constructor() {
        super()

        this.created = false
        this.config = CONFIG

        if (process.env.NODE_NOT_TESSEL) {
            setTimeout(() => this.onCreated(null, {}), 100)
            return;
        } else {
            const tessel = require('tessel')

            this.network = tessel.network
            this.network.wifi.disable()
            this.network.ap.disable()
            this.network.ap.on(ERROR, (err) => this.onError(err))
            this.network.ap.on(CREATE, (settings) => this.onCreated(settings))
        }
    }

    create () {
        if (this.created) return

        let { ssid, password, security } = this.config

        this.created = true

        if (process.env.NODE_NOT_TESSEL) return;

        this.network.ap.create({
            ssid,
            password,
            security
        })
    }

    onCreated (settings) {
        this.emit(READY)
    }

    onPrepared () {
        this.create()
    }

    onError (err) {
        this.emit(DISCONNECT)
        this.created = false
        this.create()
    }
}

Network.events = {
    READY,
    ERROR,
    DISCONNECT,
    TIMEOUT
}

module.exports = Network