import { makeAutoObservable } from 'mobx'
import { v4 as uuidv4 } from 'uuid'

export type Canvas = HTMLCanvasElement | null

class CanvasState {
	canvas: Canvas = null
	undoList: string[] = []
	redoList: string[] = []
	username: string = 'Lol-' + uuidv4().slice(0, 5)
	session: string | null = null
	socket: WebSocket | null = null

	constructor() {
		makeAutoObservable(this)
	}

	setCanvas(canvas: Canvas) {
		this.canvas = canvas
	}

	pushToUndo(data: string) {
		this.undoList.push(data)
	}

	pushToRedo(data: string) {
		this.redoList.push(data)
	}

	undo() {
		if (!this.canvas) return
		const context = this.canvas.getContext('2d')

		if (this.undoList.length) {
			const dataUrl = this.undoList.pop()
			this.redoList.push(this.canvas.toDataURL() as string)
			const img = new Image()
			img.src = dataUrl as string
			img.onload = () => {
				if (!this.canvas || !context || !dataUrl) return
				context.clearRect(0, 0, this.canvas.width, this.canvas.height)
				context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
			}

			this.socket?.send(
				JSON.stringify({
					method: 'undo',
					session: this.session,
					username: this.username,
					image: dataUrl,
				})
			)
		}
	}

	redo() {
		if (!this.canvas) return
		const context = this.canvas.getContext('2d')

		if (this.redoList.length) {
			const dataUrl = this.redoList.pop()
			this.undoList.push(this.canvas.toDataURL() as string)
			const img = new Image()
			img.src = dataUrl as string
			img.onload = () => {
				if (!this.canvas || !context || !dataUrl) return
				context.clearRect(0, 0, this.canvas.width, this.canvas.height)
				context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
			}
			// Отправляем событие redo
			this.socket?.send(
				JSON.stringify({
					method: 'redo',
					session: this.session,
					username: this.username,
					image: dataUrl,
				})
			)
		}
	}

	setUsername(username: string) {
		if (username.trim() && username.length < 20) {
			this.username = username
		}
	}

	setSession(session: string) {
		this.session = session
	}

	setWebsocket(socket: WebSocket) {
		if (!this.socket) {
			this.socket = socket
		}
	}

	resetWebSocket() {
		if (this.socket) {
			this.socket.close()
			this.socket = null
		}
	}
}

export default new CanvasState()
