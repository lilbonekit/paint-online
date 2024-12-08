import canvasState, { Canvas } from '@/store/canvasState'
import Tool from './Tool'
import { Events } from '../../../types'

export default class Line extends Tool {
	startX: number
	startY: number
	isDrawing: boolean
	saved: string

	constructor(canvas: Canvas, socket: WebSocket, session: string) {
		super(canvas, socket, session)
		this.startX = 0
		this.startY = 0
		this.isDrawing = false
		this.saved = ''
	}

	mouseDownHandler(e: MouseEvent) {
		if (!this.context || !(e.target instanceof HTMLElement) || !this.canvas)
			return

		this.isDrawing = true
		this.startX = e.pageX - e.target.offsetLeft
		this.startY = e.pageY - e.target.offsetTop
		this.saved = this.canvas.toDataURL() // Save the current state of the canvas
	}

	mouseMoveHandler(e: MouseEvent) {
		if (!this.isDrawing || !this.context || !(e.target instanceof HTMLElement))
			return

		const currentX = e.pageX - e.target.offsetLeft
		const currentY = e.pageY - e.target.offsetTop

		const img = new Image()
		img.src = this.saved
		img.onload = () => {
			if (!this.context || !this.canvas) return

			// Restore the saved state
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
			this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)

			// Draw the temporary line
			this.context.beginPath()
			this.context.moveTo(this.startX, this.startY)
			this.context.lineTo(currentX, currentY)
			this.context.stroke()
		}
	}

	mouseUpHandler() {
		if (!this.isDrawing || !this.context || !this.canvas) return

		this.isDrawing = false

		// Send the final canvas state
		const imageData = this.canvas.toDataURL()
		this.socket.send(
			JSON.stringify({
				method: Events.Draw,
				username: canvasState.username,
				session: this.session,
				image: imageData,
			})
		)
	}

	static draw(
		context: CanvasRenderingContext2D,
		opts: { startX: number; startY: number; endX: number; endY: number }
	) {
		if (!context) return
		const { startX, startY, endX, endY } = opts

		// Draw a line
		context.beginPath()
		context.moveTo(startX, startY)
		context.lineTo(endX, endY)
		context.stroke()
	}
}
