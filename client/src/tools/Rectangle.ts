import canvasState, { Canvas } from '@/store/canvasState'
import Tool from './Tool'
import { Events } from '../../../types'

export default class Rectangle extends Tool {
	startX: number = 0 // Starting X coordinate of the rectangle
	startY: number = 0 // Starting Y coordinate of the rectangle
	width: number = 0 // Width of the rectangle
	height: number = 0 // Height of the rectangle
	saved: string = '' // Stores the current canvas state as an image

	constructor(canvas: Canvas, socket: WebSocket, session: string) {
		super(canvas, socket, session)
	}

	/**
	 * Handles the mouse down event to start drawing the rectangle.
	 * Saves the starting coordinates and the current canvas state.
	 */
	mouseDownHandler(e: MouseEvent) {
		if (!this.context || !(e.target instanceof HTMLElement) || !this.canvas)
			return

		this.mouseDown = true
		this.context.beginPath()
		this.startX = e.pageX - e.target.offsetLeft
		this.startY = e.pageY - e.target.offsetTop
		this.saved = this.canvas.toDataURL() // Save the current canvas state
	}

	/**
	 * Handles the mouse up event to finalize the rectangle.
	 * Sends the final canvas state to synchronize with other clients.
	 */
	mouseUpHandler(e: MouseEvent) {
		if (!this.context || !(e.target instanceof HTMLElement) || !this.canvas)
			return

		this.mouseDown = false

		// Capture the final canvas state as an image
		const imageData = this.canvas.toDataURL()

		// Send the canvas state over WebSocket
		this.socket.send(
			JSON.stringify({
				method: Events.Draw,
				username: canvasState.username,
				session: this.session,
				image: imageData,
			})
		)
	}

	/**
	 * Handles the mouse move event to draw a temporary rectangle.
	 * Clears the canvas and redraws the saved state with the current rectangle.
	 */
	mouseMoveHandler(e: MouseEvent) {
		if (
			!this.context ||
			!(e.target instanceof HTMLElement) ||
			!this.socket ||
			!this.mouseDown
		)
			return

		const currentX = e.pageX - e.target.offsetLeft
		const currentY = e.pageY - e.target.offsetTop
		this.width = currentX - this.startX
		this.height = currentY - this.startY

		// Load the saved canvas state
		const img = new Image()
		img.src = this.saved
		img.onload = () => {
			if (!this.context || !this.canvas) return

			// Clear the canvas and draw the saved state
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
			this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)

			// Draw the temporary rectangle
			Rectangle.draw(this.context, {
				x: this.startX,
				y: this.startY,
				width: this.width,
				height: this.height,
				fillStyle: this.context.fillStyle as string,
				strokeStyle: this.context.strokeStyle as string,
				lineWidth: this.context.lineWidth,
			})
		}
	}

	/**
	 * Static method to draw a rectangle on the canvas.
	 * Used for rendering rectangles from WebSocket messages.
	 */
	static draw(
		context: CanvasRenderingContext2D,
		opts: {
			x: number
			y: number
			width: number
			height: number
			fillStyle: string
			strokeStyle: string
			lineWidth: number
		}
	) {
		if (!context) return
		const { x, y, width, height, fillStyle, strokeStyle, lineWidth } = opts

		// Set the styles for the rectangle
		context.fillStyle = fillStyle
		context.strokeStyle = strokeStyle
		context.lineWidth = lineWidth

		// Draw the rectangle
		context.beginPath()
		context.rect(x, y, width, height)
		context.fill()
		context.stroke()
	}
}
