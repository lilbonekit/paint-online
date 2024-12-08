import canvasState, { Canvas } from '@/store/canvasState'
import Tool from './Tool'
import { Events } from '../../../types'

export default class Ellipse extends Tool {
	startX: number // Starting X-coordinate for the ellipse
	startY: number // Starting Y-coordinate for the ellipse
	saved: string // Stores the snapshot of the canvas before drawing starts

	constructor(canvas: Canvas, socket: WebSocket, session: string) {
		super(canvas, socket, session)
		this.startX = 0
		this.startY = 0
		this.saved = ''
	}

	/**
	 * Handles the mouse down event.
	 * Saves the current canvas state and initializes the starting position for the ellipse.
	 */
	mouseDownHandler(e: MouseEvent) {
		if (!this.context || !(e.target instanceof HTMLElement) || !this.canvas)
			return

		this.mouseDown = true
		this.startX = e.pageX - e.target.offsetLeft
		this.startY = e.pageY - e.target.offsetTop

		// Save the current state of the canvas as a data URL
		this.saved = this.canvas.toDataURL()
	}

	/**
	 * Handles the mouse move event.
	 * Clears the canvas, restores the saved image, and draws a temporary ellipse.
	 */
	mouseMoveHandler(e: MouseEvent) {
		if (!this.mouseDown || !this.context || !(e.target instanceof HTMLElement))
			return

		const currentX = e.pageX - e.target.offsetLeft
		const currentY = e.pageY - e.target.offsetTop

		const img = new Image()
		img.src = this.saved
		img.onload = () => {
			if (!this.context || !this.canvas) return

			// Clear the canvas and restore the previous image
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
			this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)

			// Draw a temporary ellipse
			this.draw(currentX, currentY)
		}
	}

	/**
	 * Handles the mouse up event.
	 * Finalizes the ellipse drawing and sends the final canvas snapshot over WebSocket.
	 */
	mouseUpHandler(e: MouseEvent) {
		if (!this.context || !(e.target instanceof HTMLElement) || !this.canvas)
			return

		this.mouseDown = false

		// Send the final canvas snapshot as a data URL
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

	/**
	 * Draws an ellipse on the canvas.
	 * @param currentX - The current X-coordinate of the mouse
	 * @param currentY - The current Y-coordinate of the mouse
	 */
	draw(currentX: number, currentY: number) {
		if (!this.context) return

		// Calculate ellipse dimensions and center
		const width = Math.abs(currentX - this.startX)
		const height = Math.abs(currentY - this.startY)
		const centerX = this.startX + (currentX - this.startX) / 2
		const centerY = this.startY + (currentY - this.startY) / 2

		// Draw the ellipse
		this.context.beginPath()
		this.context.ellipse(
			centerX,
			centerY,
			width / 2,
			height / 2,
			0,
			0,
			2 * Math.PI
		)
		this.context.fill()
		this.context.stroke()
	}

	/**
	 * Static method for rendering an ellipse.
	 * This is used to apply ellipse drawings from other clients.
	 * @param context - The rendering context of the canvas
	 * @param opts - Options for the ellipse (position, dimensions, styles)
	 */
	static draw(
		context: CanvasRenderingContext2D,
		opts: {
			x: number // Center X-coordinate
			y: number // Center Y-coordinate
			width: number // Width of the ellipse
			height: number // Height of the ellipse
			fillStyle: string // Fill color of the ellipse
			strokeStyle: string // Stroke color of the ellipse
		}
	) {
		if (!context) return

		const { x, y, width, height, fillStyle, strokeStyle } = opts

		// Set the fill and stroke styles
		context.fillStyle = fillStyle
		context.strokeStyle = strokeStyle

		// Draw the ellipse
		context.beginPath()
		context.ellipse(x, y, width / 2, height / 2, 0, 0, 2 * Math.PI)
		context.fill()
		context.stroke()
	}
}
