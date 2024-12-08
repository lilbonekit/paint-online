import { Tool } from '@/tools'
import { makeAutoObservable } from 'mobx'

type Tools = Tool | null

class ToolState {
	tool: Tools = null
	constructor() {
		makeAutoObservable(this)
	}

	// actions
	setTool(tool: Tools) {
		this.tool = tool
	}

	setFillColor(color: string) {
		if (!this.tool) return
		this.tool.fillColor = color
	}

	setStrokeColor(color: string) {
		if (!this.tool) return
		this.tool.strokeColor = color
	}

	setWidth(width: number) {
		if (!this.tool) return
		this.tool.lineWidth = width
	}
}

export default new ToolState()
