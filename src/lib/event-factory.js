// create 'standardized' events that travel between server and client
// can be more error prone sending strings from the client/server code,
// since we use object methods that instantly show up as an error when mistyped,
// instead of strings

const event = {
    type: '',
    message: '',
    data: []
}

function getEventObj () {
    return Object.assign({}, event);
}

module.exports = {

    handshake: function () {
        let event = getEventObj()

        event.type = 'hello'

        return JSON.stringify(event)
    },

    full: function (message = "Sorry, we're full") {
        let event = getEventObj()

        event.type = 'full'
        event.message = message

        return JSON.stringify(event)
    },

    start: function (time) {
        let event = getEventObj()

        event.type = 'start'
        event.data[0] = time

        return JSON.stringify(event)
    },

    warmupStart: function () {
        let event = getEventObj()

        event.type = 'warmup-start'

        return JSON.stringify(event)
    },

    warmupFinished: function () {
        let event = getEventObj()

        event.type = 'warmup-finished'

        return JSON.stringify(event)
    },

    brewStart: function () {
        let event = getEventObj()

        event.type = 'brew-start'

        return JSON.stringify(event)
    },

    brewFinished: function () {
        let event = getEventObj()

        event.type = 'brew-finished'

        return JSON.stringify(event)
    },

    brewProgress: function () {
        let event = getEventObj()

        event.type = 'brew-progress'

        return JSON.stringify(event)
    }



}