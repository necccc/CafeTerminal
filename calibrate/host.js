// host has ws server, tessel connects to it
// host sends on/off signal to relay
const readline = require('readline');
const EventEmitter = require('events')
const WebSocket = require('ws');


class Toggle extends EventEmitter {
    constructor () {
        super()

        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);

        process.stdin.on('keypress', (str, key) => {
            //console.log(str)
            //console.log(key)

            if (key.name === 'c' && key.ctrl) process.exit();

            if (key.name === 'space') this.emit('space');
        })

    }    
}

const toggle = new Toggle()

const wss = new WebSocket.Server({ port: 8080 });

wss.on('error', (err) => {
    console.log('WebSocket Server error')
    console.log(err)
    process.exit()
});

let state = false;

wss.on('connection', (ws) => {

    toggle.on('space', () => {
        console.log('.')
        state = !state
        ws.send(JSON.stringify({ toggle: state }))
    })

    if (wss.clients.size > 1) {
        ws.send(Events.full())
        ws.close();
        return;
    }

    ws.on('message', (message) => {
        let event = messageParse(message)

        if (event.type === 'start') {
            coffeeMaker.start(event.data[0])
        }

        console.log(event)
    });

    ws.on('close', () => {
        toggle.removeAllListeners('space')
    });

    
});




