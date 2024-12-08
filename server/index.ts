import express from 'express'
import ws from 'express-ws'
import { WebSocket as WsWebSocket } from 'ws'

const app = express()
const WSServer = ws(app)
const PORT = process.env.PORT || 5000
const aWss = WSServer.getWss()
import { Events, Message } from '../types'

interface ExtendedWebSocket extends WsWebSocket {
	session?: string
	username?: string
}

WSServer.app.ws('/', (ws: ExtendedWebSocket, req) => {
	ws.on('message', (message: string) => {
		try {
			const parsedMessage: Message = JSON.parse(message)
			const { method } = parsedMessage

			switch (method) {
				case Events.Connection:
					connectionHandler(ws, parsedMessage)
					break
				case Events.Draw:
					broadcastConnection(ws, parsedMessage)
					break
				case Events.Undo:
				case Events.Redo:
					actionHandler(ws, parsedMessage)
					break

				default:
					console.log(`Unknown method: ${method}`)
					ws.send(`Error: Unknown method "${method}"`)
					break
			}
		} catch (error) {
			console.error('Invalid message format:', error)
			ws.send('Error: Invalid message format')
		}
	})
})

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))

const connectionHandler = (ws: ExtendedWebSocket, parsedMessage: Message) => {
	ws.session = parsedMessage.session
	broadcastConnection(ws, parsedMessage)
}

const broadcastConnection = (ws: ExtendedWebSocket, parsedMessage: Message) => {
	console.log(parsedMessage)
	const { username, session } = parsedMessage

	aWss.clients.forEach((client) => {
		const extendedClient = client as ExtendedWebSocket
		if (extendedClient.session === session) {
			extendedClient.send(JSON.stringify(parsedMessage))
		}
	})

	console.log(`User ${username} connected with session ${session}`)
}

const actionHandler = (ws: ExtendedWebSocket, parsedMessage: Message) => {
	const { session, username, image } = parsedMessage

	// Broadcast the updated canvas state to all clients in the same session
	aWss.clients.forEach((client) => {
		const extendedClient = client as ExtendedWebSocket
		if (extendedClient.session === session) {
			extendedClient.send(
				JSON.stringify({
					method: parsedMessage.method,
					username,
					session,
					image, // Include the updated canvas state
				})
			)
		}
	})
}
