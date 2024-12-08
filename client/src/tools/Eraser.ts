import canvasState, { Canvas } from '@/store/canvasState'
import Tool from './Tool'
import { Events, FigureTypes } from '../../../types'

export default class Eraser extends Tool {
	saved: string = '' // Stores the current canvas state as an image
	lastSentTime: number = 0 // Used to limit the frequency of sending canvas updates

	constructor(canvas: Canvas, socket: WebSocket, session: string) {
		super(canvas, socket, session)
		this.socket = socket
		this.session = session
	}

	/**
	 * Handles the mouse down event to start erasing.
	 * Saves the current canvas state as an image.
	 */
	mouseDownHandler(e: MouseEvent) {
		if (!this.context || !(e.target instanceof HTMLElement) || !this.canvas)
			return

		this.mouseDown = true
		this.saved = this.canvas.toDataURL() // Save the current canvas state
	}

	/**
	 * Handles the mouse move event while the mouse is pressed.
	 * Draws the eraser effect on the canvas and sends canvas updates at intervals.
	 */
	mouseMoveHandler(e: MouseEvent) {
		if (
			!this.mouseDown ||
			!this.context ||
			!(e.target instanceof HTMLElement) ||
			!this.canvas
		)
			return

		const x = e.pageX - e.target.offsetLeft
		const y = e.pageY - e.target.offsetTop

		// Draw the eraser effect on the canvas
		this.draw(x, y)

		// Send the canvas state if the interval condition is met
		if (this.shouldSendImage()) {
			this.sendCanvasState()
		}
	}

	/**
	 * Handles the mouse up event to stop erasing.
	 * Sends the final canvas state to synchronize with other clients.
	 */
	mouseUpHandler() {
		if (!this.context || !this.canvas) return

		this.mouseDown = false

		// Send the final canvas state
		this.sendCanvasState()
	}

	/**
	 * Draws the eraser effect at the given coordinates.
	 * Uses `destination-out` to make pixels transparent.
	 */
	draw(x: number, y: number) {
		if (!this.context) return

		this.context.save()
		this.context.globalCompositeOperation = 'destination-out' // Makes pixels transparent
		this.context.beginPath()
		this.context.arc(x, y, this.context.lineWidth / 2, 0, 2 * Math.PI) // Draws an arc for erasing
		this.context.fill()
		this.context.restore()
	}

	/**
	 * Static method to render an image received via WebSocket.
	 * Clears the canvas and redraws the image.
	 */
	static drawFromImage(
		context: CanvasRenderingContext2D,
		imageSrc: string,
		canvasWidth: number,
		canvasHeight: number
	) {
		const img = new Image()
		img.src = imageSrc
		img.onload = () => {
			context.clearRect(0, 0, canvasWidth, canvasHeight) // Clears the canvas
			context.drawImage(img, 0, 0, canvasWidth, canvasHeight) // Draws the received image
		}
	}

	/**
	 * Determines whether enough time has passed to send another canvas update.
	 * Limits updates to one every 100 milliseconds.
	 */
	private shouldSendImage(): boolean {
		const now = Date.now()
		if (now - this.lastSentTime > 100) {
			this.lastSentTime = now
			return true
		}
		return false
	}

	/**
	 * Sends the current canvas state as a base64 image via WebSocket.
	 * Ensures synchronization with other clients.
	 */
	private sendCanvasState() {
		const imageData = this.canvas?.toDataURL()
		if (imageData) {
			this.socket.send(
				JSON.stringify({
					method: Events.Draw,
					username: canvasState.username,
					session: this.session,
					figure: { type: FigureTypes.Eraser }, // Identifies the eraser tool
					image: imageData, // Sends the current canvas state as an image
				})
			)
		}
	}
}
