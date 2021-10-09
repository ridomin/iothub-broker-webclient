import {getIoTHubV2Credentials} from 'https://www.unpkg.com/iothub-auth'

const gbid = id => document.getElementById(id)

const bindUI = () => {
    gbid('connectButton').onclick = async() => await connectClient()
    gbid('disconnectButton').onclick = async() => await disconnectClient()
}

const connectStatus = (isConnected, message) => {
    const statusDiv = gbid('connectionStatus')
    const statusMsg = gbid('statusMessage')
    const errorDiv = gbid('errorMessages')
    if (isConnected) {
        statusDiv.className = 'connected'
        errorDiv.innerText = ''
        gbid('connectionInfo').style.display='none'
        gbid('connectButton').disabled = true
        gbid('disconnectButton').disabled = false
    } else {
        gbid('connectionInfo').style.display='block'
        statusDiv.className = 'disconnected'
        gbid('connectButton').disabled = false
        gbid('disconnectButton').disabled = true
    }
    statusMsg.innerText = message
}

const showError = err => {
    const errorDiv = gbid('errorMessages')
    errorDiv.innerText = err
    client = null
}
let client

const disconnectClient = async () => client.end(true)

const connectClient = async () => {
    const hostname = gbid('hostname').value 
    const deviceId = gbid('deviceId').value
    const key = gbid('key').value
    const [username, password] = await getIoTHubV2Credentials(hostname, deviceId, key, 60)
    client = mqtt.connect(`wss://${hostname}:443/mqtt`, { clientId: deviceId, username, password })
    client.on('connect', () => connectStatus(true, `Conneted to ${hostname} as ${deviceId} device`))
    //client.on('close', () => connectStatus(false, `Connection Closed`))
    client.on('end', () => connectStatus(false, `Ended`))
    client.on('error', err => showError(err.message))
    client.on('message', (t, m) => {
        const el = gbid('output')
        el.innerText += t + '\n'
        el.innerText += ' ' +m + '\n'
    })
    client.subscribe('vehicles/#')
}
bindUI()