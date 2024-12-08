import App from '@/App'
import Intro from '@/Intro'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
	{
		path: '/',
		element: <Intro />,
	},
	{
		path: '/:session',
		element: <App />,
	},
])

function Router() {
	return <RouterProvider router={router} />
}

export default Router
