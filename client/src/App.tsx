import Canvas from '@/components/Canvas'
import SettingBar from '@/components/SettingBar'
import Toolbar from '@/components/Toolbar'
import { Outlet } from 'react-router-dom'

import '@/styles/App.css'

function App() {
	return (
		<div className="h-screen max-h-screen w-screen bg-main">
			<Toolbar />
			<SettingBar />
			<Canvas />
			<Outlet />
		</div>
	)
}

export default App
