import toolState from '@/store/toolState'

export default function SettingBar() {
	return (
		<div className="bar top-10">
			<div className="container">
				<div className="flex gap-4">
					<label className="flex gap-2">
						Line width (px):
						<input
							className="w-12"
							type="number"
							defaultValue={1}
							min={1}
							max={70}
							onChange={(e) => toolState.setWidth(Number(e.target.value))}
						/>
					</label>
					<label className="flex gap-2">
						Stroke color:
						<input
							className="w-12"
							type="color"
							onChange={(e) => toolState.setStrokeColor(e.target.value)}
						/>
					</label>
				</div>
			</div>
		</div>
	)
}
