import { useEffect, useState, useRef } from 'react'
import Map from './Map'
import type { LatLngExpression } from 'leaflet'
import './App.css'

const App = () => {
	const ws = useRef<WebSocket>()

	const [ufoCoordinates, setUFOCoordinates] = useState<LatLngExpression>([
		37.272011, -115.815498,
	])

	const [ufoCoordinatesHistory, setUFOCoordinatesHistory] = useState<
		LatLngExpression[]
	>([])

	const [socket, setSocket] = useState<WebSocket>()

	useEffect(() => {
		const websocket = new WebSocket('ws://localhost:8080/')

		websocket.onopen = () => {
			console.log('Web Socket connected.')
		}

		websocket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data)
				console.log(data)
				setUFOCoordinates([data.latitude, data.longitude])
			} catch (e) {
				console.log('error parsing WS data: ', e)
			}
		}

		websocket.onclose = (event) => {
			if (websocket && websocket.readyState === websocket.OPEN) {
				websocket.close(100, 'Closing WS connection')
			}
			console.log('Connection closed: ', event)
		}

		websocket.onerror = (error) => {
			console.log('WS error: ', error)
			// Add a POST request to send error to server
		}

		websocket.send
		ws.current = websocket

		setSocket(websocket)

		return () => {
			websocket.close()
		}
	}, [])

	useEffect(() => {
		setUFOCoordinatesHistory((prev) => [...prev, ufoCoordinates])
	}, [ufoCoordinates])

	const sendMessage = (message: string) => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(message)
		}
	}

	return (
		<Map
			ufoCoordinates={ufoCoordinates}
			ufoCoordinatesHistory={ufoCoordinatesHistory}
			sendMessageCallback={sendMessage}
		/>
	)
}

export default App
