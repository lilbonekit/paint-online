import { Canvas } from '@/store/canvasState'

export interface ToolInterface {
	canvas: Canvas | null
	context: CanvasRenderingContext2D | null
	socket: WebSocket
	session: string

	mouseDownHandler(e: MouseEvent): void
	mouseMoveHandler(e: MouseEvent): void
	mouseUpHandler(e: MouseEvent): void
}

export default abstract class Tool implements ToolInterface {
	canvas: Canvas | null
	context: CanvasRenderingContext2D | null
	socket: WebSocket
	session: string
	mouseDown: boolean

	constructor(canvas: Canvas, socket: WebSocket, session: string) {
		this.canvas = canvas
		this.context = canvas?.getContext('2d') || null
		this.socket = socket
		this.session = session
		this.mouseDown = false

		this.listen()
	}

	set fillColor(color: string) {
		if (this.context) this.context.fillStyle = color
	}

	set strokeColor(color: string) {
		if (this.context) this.context.strokeStyle = color
	}

	set lineWidth(width: number) {
		if (this.context && width > 0 && width <= 100) {
			this.context.lineWidth = width
		}
	}

	private listen() {
		if (this.canvas) {
			this.canvas.onmousedown = this.mouseDownHandler.bind(this)
			this.canvas.onmousemove = this.mouseMoveHandler.bind(this)
			this.canvas.onmouseup = this.mouseUpHandler.bind(this)
		}
	}

	abstract mouseDownHandler(e: MouseEvent): void
	abstract mouseMoveHandler(e: MouseEvent): void
	abstract mouseUpHandler(e: MouseEvent): void

	static draw(context: CanvasRenderingContext2D, ...args: unknown[]): void {
		if (!context || !args) return
		throw new Error('Static method draw must be implemented in the subclass')
	}
}
