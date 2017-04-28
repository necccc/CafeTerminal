const Network = require('./Network')
const server = require('./server')

const net = new Network()

net.once(Network.events.READY, () => {
    server.create()
})

net.create()

