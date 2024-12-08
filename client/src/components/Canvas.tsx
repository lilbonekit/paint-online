import canvasState, { type Canvas } from '@/store/canvasState'
import toolState from '@/store/toolState'
import Brush from '@/tools/Brush'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Events, Message, FigureTypes } from '../../../types'
import { Eraser } from '@/tools'

const Canvas = observer(() => {
	const canvasRef = useRef<Canvas>(null)
	const { session } = useParams()

	useEffect(() => {
		canvasState.setCanvas(canvasRef.current)
	}, [])

	useEffect(() => {
		if (!canvasState.socket) {
			const socket = new WebSocket('ws://localhost:5000/')
			canvasState.setWebsocket(socket)
			canvasState.setSession(session as string)

			socket.onopen = () => {
				socket.send(
					JSON.stringify({
						session,
						username: canvasState.username,
						method: Events.Connection,
					})
				)
			}

			socket.onmessage = (event) => {
				const msg: Message = JSON.parse(event.data)
				const canvas = canvasRef.current
				console.log(msg.method)

				switch (msg.method) {
					case Events.Connection:
						alert(
							msg.username === canvasState.username
								? 'You just connected!'
								: `${msg.username} just connected!`
						)
						toolState.setTool(new Brush(canvas, socket, session as string))
						break
					case Events.Draw:
						drawHandler(msg)
						break
					case Events.Undo:
					case Events.Redo:
						actionHandler(msg)
						break
					default:
						break
				}
			}

			socket.onclose = () => {
				console.log('WebSocket connection closed')
			}
		}

		return () => {
			canvasState.resetWebSocket()
		}
	}, [session])

	const mouseDownHandler = () => {
		if (canvasRef.current) {
			canvasState.pushToUndo(canvasRef.current.toDataURL())
		}
	}

	const actionHandler = (msg: Message) => {
		const canvas = canvasRef.current
		if (!canvas) return
		const img = new Image()
		img.src = msg.image // Updated canvas image from the server
		img.onload = () => {
			const context = canvas?.getContext('2d')
			if (context) {
				context.clearRect(0, 0, canvas.width, canvas.height)
				context.drawImage(img, 0, 0, canvas.width, canvas.height)
			}
		}
	}

	const drawHandler = (msg: Message) => {
		const img = new Image()
		img.src = msg.image

		img.onload = () => {
			const context = canvasRef.current?.getContext('2d')
			if (context) {
				context.drawImage(img, 0, 0)
			}
		}

		const context = canvasRef.current?.getContext(
			'2d'
		) as CanvasRenderingContext2D
		const canvas = canvasRef.current

		switch (msg?.figure?.type) {
			/**
			 * The eraser tool operates differently compared to other tools like the brush or rectangle.
			 *
			 * For tools like the brush, only minimal data (e.g., coordinates, styles) is sent over the WebSocket.
			 * This approach is efficient and lightweight, as the tool's behavior can be reconstructed on the client
			 * using the received data.
			 *
			 * However, the eraser modifies the canvas by introducing transparency (via `globalCompositeOperation`),
			 * which is challenging to represent using simple coordinates and styles. To ensure accurate synchronization
			 * between clients, the entire canvas state is sent as a data URL (`canvas.toDataURL()`).
			 *
			 * This design guarantees that all erased areas are properly rendered on other clients, but it is more
			 * network-intensive since the entire canvas image is transmitted instead of lightweight metadata.
			 *
			 * The trade-off: simplicity and accuracy of synchronization for the eraser at the cost of increased data transfer.
			 */
			case FigureTypes.Eraser:
				if (context && canvas) {
					Eraser.drawFromImage(context, msg.image, canvas.width, canvas.height)
				}
				break

			default:
				break
		}

		context.drawImage(img, 0, 0)
	}

	return (
		<div className="h-full flex items-center justify-center">
			<canvas
				ref={canvasRef}
				onMouseDown={mouseDownHandler}
				className="border border-gray-300 bg-white"
				width={600}
				height={600}
			/>
		</div>
	)
})

export default Canvas
