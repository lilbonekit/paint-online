import canvasState, { Canvas } from '@/store/canvasState'
import Tool from './Tool'
import { Events } from '../../../types'

export default class Brush extends Tool {
	saved: string = '' // Stores the snapshot of the canvas before drawing starts

	constructor(canvas: Canvas, socket: WebSocket, session: string) {
		super(canvas, socket, session)
		this.socket = socket
		this.session = session
	}

	/**
	 * Handles the mouse down event.
	 * Saves the current state of the canvas and begins drawing.
	 */
	mouseDownHandler(e: MouseEvent) {
		if (!this.context || !(e.target instanceof HTMLElement) || !this.canvas)
			return

		this.mouseDown = true

		// Save the current state of the canvas as a data URL
		this.saved = this.canvas.toDataURL()

		// Start drawing
		this.context.beginPath()
		this.context.moveTo(
			e.pageX - e.target.offsetLeft,
			e.pageY - e.target.offsetTop
		)
	}

	/**
	 * Handles the mouse up event.
	 * Completes the drawing operation and sends the final canvas snapshot.
	 */
	mouseUpHandler() {
		if (!this.canvas) return

		// Finish the drawing operation
		this.mouseDown = false

		// Send the final snapshot of the canvas
		const image = this.canvas.toDataURL()
		this.socket.send(
			JSON.stringify({
				method: Events.Draw,
				username: canvasState.username,
				session: this.session,
				image, // Sending the final snapshot of the canvas
			})
		)
	}

	/**
	 * Handles the mouse move event.
	 * Draws locally on the canvas and sends intermediate snapshots over WebSocket.
	 */
	mouseMoveHandler(e: MouseEvent) {
		if (!this.context || !(e.target instanceof HTMLElement) || !this.mouseDown)
			return

		// Local drawing
		const x = e.pageX - e.target.offsetLeft
		const y = e.pageY - e.target.offsetTop
		Brush.draw(this.context, x, y, this.context.fillStyle as string)

		// Send an intermediate snapshot of the canvas
		const image = this.canvas?.toDataURL()
		this.socket.send(
			JSON.stringify({
				method: Events.Draw,
				session: this.session,
				username: canvasState.username,
				image, // Sending the intermediate snapshot
			})
		)
	}

	/**
	 * Static method for rendering the brush strokes.
	 * This is used to apply brush strokes on other clients.
	 */
	static draw(
		context: CanvasRenderingContext2D,
		x: number,
		y: number,
		fillStyle: string
	) {
		if (!context) return

		// Set the fill color for the brush
		context.fillStyle = fillStyle

		// Draw a line to the specified coordinates
		context.lineTo(x, y)
		context.stroke()
	}
}
