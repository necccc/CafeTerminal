
const CoffeeMaker = require('./CoffeeMaker')
const Events = require('./lib/event-factory')
const messageParse = require('./lib/message-parser.js')
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const coffeeMaker = new CoffeeMaker()

const send = function (event) {
    wss.clients.forEach((ws) => ws.send(event))
}

coffeeMaker.on(CoffeeMaker.events.EVENT_WARMUP_START, () => send(Events.warmupStart()))
coffeeMaker.on(CoffeeMaker.events.EVENT_WARMUP_FINISHED, () => send(Events.warmupFinished()))
coffeeMaker.on(CoffeeMaker.events.EVENT_BREW_START, () => send(Events.brewStart()))
coffeeMaker.on(CoffeeMaker.events.EVENT_BREW_FINISHED, () => send(Events.brewFinished()))
coffeeMaker.on(CoffeeMaker.events.EVENT_BREW_PROGRESS, () => send(Events.brewProgress()))

wss.on('connection', (ws) => {

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
        coffeeMaker.powerOff()
    });

    ws.send(Events.handshake());
});