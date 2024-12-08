export enum Events {
	Connection = 'connection',
	Draw = 'draw',
	Finish = 'finish',
	Undo = 'undo',
	Redo = 'redo',
}

export interface Message {
	session: string
	username: string
	method: Events
	figure: Figure
	image: string
}

export interface Figure {
	type: string
	x: number
	y: number
	width: number
	height: number
	fillStyle: string
	strokeStyle: string
	lineWidth: number
}

export enum FigureTypes {
	Brush = 'brush',
	Finish = 'finish',
	Rectangle = 'rectangle',
	Eraser = 'eraser',
}
