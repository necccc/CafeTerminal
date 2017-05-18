const Network = require('./Network')
const server = require('./server')

const net = new Network()

net.once(Network.events.READY, () => {
    server.create() // if the network ready, fire up the websocket server
})

net.create() // boot up networking

