import { HiOutlinePaintBrush } from 'react-icons/hi2'
import {
	RxSquare,
	RxCircle,
	RxEraser,
	RxBorderSolid,
	RxArrowLeft,
	RxArrowRight,
} from 'react-icons/rx'
import { AiOutlineSave } from 'react-icons/ai'
import toolState from '@/store/toolState'
import canvasState from '@/store/canvasState'
import { Brush, Rectangle, Ellipse, Eraser, Line } from '@/tools'

const tools = [
	{
		title: 'Brush',
		icon: <HiOutlinePaintBrush size={20} />,
		onClick: () =>
			toolState.setTool(
				new Brush(
					canvasState.canvas,
					canvasState.socket as WebSocket,
					canvasState.session as string
				)
			),
	},
	{
		title: 'Rectangle',
		icon: <RxSquare size={20} />,
		onClick: () =>
			toolState.setTool(
				new Rectangle(
					canvasState.canvas,
					canvasState.socket as WebSocket,
					canvasState.session as string
				)
			),
	},
	{
		title: 'Circle',
		icon: <RxCircle size={22} />,
		onClick: () =>
			toolState.setTool(
				new Ellipse(
					canvasState.canvas,
					canvasState.socket as WebSocket,
					canvasState.session as string
				)
			),
	},
	{
		title: 'Eraser',
		icon: <RxEraser size={22} />,
		onClick: () =>
			toolState.setTool(
				new Eraser(
					canvasState.canvas,
					canvasState.socket as WebSocket,
					canvasState.session as string
				)
			),
	},
	{
		title: 'Line',
		icon: <RxBorderSolid size={22} />,
		onClick: () =>
			toolState.setTool(
				new Line(
					canvasState.canvas,
					canvasState.socket as WebSocket,
					canvasState.session as string
				)
			),
	},
]

const actions = [
	{
		title: 'Undo',
		icon: <RxArrowLeft size={22} />,
		onClick: () => canvasState.undo(),
	},
	{
		title: 'Redo',
		icon: <RxArrowRight size={22} />,
		onClick: () => canvasState.redo(),
	},
	{
		title: 'Save',
		icon: <AiOutlineSave size={22} />,
		onClick: () => download(),
	},
]

const changeColor = (color: string) => {
	toolState.setFillColor(color)
	toolState.setStrokeColor(color)
}

const download = () => {
	const dataUrl = canvasState.canvas?.toDataURL()
	console.log(dataUrl)
	const a = document.createElement('a')
	a.href = dataUrl as string
	a.download = canvasState.session + '.jpg'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}

export default function Toolbar() {
	return (
		<div className="bar h-20 z-10">
			<div className="container">
				<div className="flex justify-between gap-4 flex-wrap">
					<div className="flex gap-2">
						{tools.map((tool, index) => (
							<button
								key={index}
								className="btn"
								title={tool.title}
								onClick={tool.onClick}
							>
								{tool.icon}
							</button>
						))}
						<input
							type="color"
							className="btn py-2 bg-transparent"
							title="Color"
							onChange={(e) => changeColor(e.target.value)}
						/>
					</div>
					<div className="flex gap-2">
						{actions.map((action, index) => (
							<button
								key={index}
								className="btn"
								title={action.title}
								onClick={action.onClick}
							>
								{action.icon}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
