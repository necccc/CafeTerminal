const readline = require('readline');
const EventEmitter = require('events')
const WebSocket = require('ws');

class Toggle extends EventEmitter {
    constructor () {
        super()

        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);

        process.stdin.on('keypress', (str, key) => {
            console.log(str)
            console.log(key)

            if (key.name === 'c' && key.ctrl) return process.exit();

            if (key.name === 'a') return this.emit('key-a');

            if (key.name === 'b') return this.emit('key-b');

        })

    }
}

const toggle = new Toggle()

const ws = new WebSocket('ws://192.168.1.101:8080', {
  perMessageDeflate: false
});


let a_state = false;
let b_state = false;

ws.on('open', () => {

    toggle.on('key-a', () => {
        console.log('.a')
        a_state = !a_state
        ws.send(JSON.stringify({
            port: 1,
            toggle: a_state
        }))
    })

    toggle.on('key-b', () => {
        console.log('.b')
        b_state = !b_state
        ws.send(JSON.stringify({
            port: 2,
            toggle: b_state
        }))
    })

})


ws.on('close', () => {
    toggle.removeAllListeners('key-a')
    toggle.removeAllListeners('key-b')
});
