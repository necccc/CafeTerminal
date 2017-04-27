module.exports = function (message) {
    let event = null
        try {
            event = JSON.parse(message)
        } catch(e) {
            console.error(e)
        }
    return event;
}