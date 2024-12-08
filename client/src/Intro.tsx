import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import canvasState from './store/canvasState'

function Intro() {
	const [username, setUsername] = useState<string>('')
	const [lobbyId, setLobbyId] = useState<string>('')
	const navigate = useNavigate()

	const connectionHandler = (lobby: string) => {
		if (username.trim()) {
			canvasState.setUsername(username.trim())
			console.log(canvasState.username)
			navigate(`/${lobby}`)
		}
	}

	return (
		<div className="bg-main h-screen grid content-center">
			<div className="flex flex-col items-center gap-10 w-full mx-auto">
				<h1 className="text-6xl text-center">Welcome to paint online</h1>
				<div className="flex flex-col gap-2">
					<label className="flex flex-col items-center gap-1">
						Your nickname
						<input
							type="text"
							className="p-3 border rounded-md"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</label>
					<label className="flex flex-col items-center gap-1">
						Existing lobby ID
						<input
							type="text"
							className="p-3 border rounded-md"
							value={lobbyId}
							onChange={(e) => setLobbyId(e.target.value)}
						/>
					</label>
				</div>
				<div className="flex flex-col items-center gap-2">
					<button
						onClick={() => connectionHandler(lobbyId)}
						className={`text-2xl w-full px-6 py-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 ${
							!lobbyId.trim() || !username.trim()
								? 'pointer-events-none opacity-50'
								: ''
						}`}
						disabled={!lobbyId.trim() || !username.trim()}
					>
						Join lobby
					</button>
					<span>OR</span>
					<button
						onClick={() => connectionHandler(uuidv4())}
						className={`text-2xl w-full px-6 py-3 rounded-md bg-green-500 text-white hover:bg-green-600 ${
							!username.trim() ? 'pointer-events-none opacity-50' : ''
						}`}
						disabled={!username.trim()}
					>
						Start new lobby
					</button>
				</div>
			</div>
		</div>
	)
}

export default Intro
