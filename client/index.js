
console.log('\n\n\tWelcome to Cafè Terminal!')
const ProgressBar = require('progress')
const Events = require('../src/lib/event-factory')
const messageParse = require('../src/lib/message-parser.js')

const BREW_DURATION = 8

const WebSocket = require('ws');

const ws = new WebSocket('ws://192.168.1.101:8080', {
  perMessageDeflate: false
});

var progressbar;

ws.on('error', () => {
    console.log('\tCould not reach the barista :( \n\n')
})

ws.on('open', function open() {
    console.log('\tSpeaking to the barista...')
});

ws.on('close', () => {
    if (progressbar) {
        progressbar.interrupt()
        progressbar = null
    }
})

ws.on('message', (data, flags) => {
    var event = messageParse(data)
   // console.log(event)

    if (event.type === 'hello') {
        ws.send(Events.start(BREW_DURATION))
    }

    if (event.type === 'warmup-start') {
        console.log('\tWarming up ...')
    }
    if (event.type === 'warmup-finished') {
        console.log('\tThe espresso machine looks warm enough!')
    }
    if (event.type === 'brew-start') {

        progressbar = new ProgressBar('\tBrewing: :bar', {
            total: BREW_DURATION,
            width: 32,
            complete: '█'
        });
        progressbar.tick()
    }

    if (event.type === 'brew-progress') {
        if (progressbar) {
            progressbar.tick()
        }
    }

    if (event.type === 'brew-finished') {
        if (progressbar) {
            progressbar = null
        }
        console.log('\tFinished! Enjoy your coffee! :) \n\n')
        ws.close()
        process.exit(0)
    }
});