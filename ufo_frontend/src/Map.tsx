import { MapContainer, TileLayer, Polyline, useMap, Pane } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useCallback, memo, useState, useEffect } from 'react'
import type { LatLngExpression } from 'leaflet'

import { MarkerLayer, Marker } from 'react-leaflet-marker'
import UFOMarker from './UFOMarker'

const mapStyles = {
	height: 'calc(100vh)',
}

export type ufoCoordinatesType = {
	latitude: number
	longitude: number
}

export type ufoCoordinatesHistoryType = LatLngExpression[]

enum POSITION_CLASSES {
	bottomleft = 'leaflet-bottom leaflet-left',
	bottomright = 'leaflet-bottom leaflet-right',
	topleft = 'leaflet-top leaflet-left',
	topright = 'leaflet-top leaflet-right',
}

export const CustomUFOControlMenu = ({
	position,
	isCenterMapOnUFOEnabled,
	onChangeCenterMapCallback,
	onChangeFlyingPatternSelectionCallback,
}: {
	position: 'bottomleft' | 'bottomright' | 'topright' | 'topleft'
	isCenterMapOnUFOEnabled: boolean
	onChangeCenterMapCallback: (
		event: React.InputHTMLAttributes<HTMLInputElement>
	) => void
	onChangeFlyingPatternSelectionCallback: (message: string) => void
} & React.ComponentPropsWithoutRef<'input'>): React.ReactNode => {
	const [selectedValue, setSelectedValue] = useState<string>('Random')

	const positionClass =
		(position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright

	const handleRadioChange = (value: string) => {
		setSelectedValue(value)
		onChangeFlyingPatternSelectionCallback(value)
	}

	const UFOFlyingPatternSelection = () => (
		<div style={{ marginTop: '10px' }}>
			<p>Select UFO flying pattern</p>
			<div>
				<input
					type='radio'
					id='Random'
					value='Random'
					checked={selectedValue === 'Random'}
					onChange={() => handleRadioChange('Random')}
				/>
				<label htmlFor='Random'>Random</label>
			</div>
			<div>
				<input
					type='radio'
					id='Circle'
					value='Circle'
					checked={selectedValue === 'Circle'}
					onChange={() => handleRadioChange('Circle')}
				/>
				<label htmlFor='Circle'>Circle</label>
			</div>
			<div>
				<input
					type='radio'
					id='Eight'
					value='Eight'
					checked={selectedValue === 'Eight'}
					onChange={() => handleRadioChange('Eight')}
				/>
				<label htmlFor='Eight'>Eight</label>
			</div>
			<div>
				<input
					type='radio'
					id='Zigzag'
					value='Zigzag'
					checked={selectedValue === 'Zigzag'}
					onChange={() => handleRadioChange('Zigzag')}
				/>
				<label htmlFor='Zigzag'>Zigzag</label>
			</div>
		</div>
	)

	return (
		<div className={positionClass}>
			<div className='leaflet-control leaflet-bar custom-control'>
				<label className='custom-label'>
					<input
						type='checkbox'
						onChange={onChangeCenterMapCallback}
						checked={isCenterMapOnUFOEnabled}
					/>
					<strong>{'Center map on UFO'}</strong>
				</label>
				<UFOFlyingPatternSelection />
			</div>
		</div>
	)
}

export function CenterMapOnUFO({
	ufoCoordinates,
}: {
	ufoCoordinates: LatLngExpression
}) {
	const map = useMap()
	const viewportBounds = map.getBounds()

	useEffect(() => {
		const testUFOIsInMap = setInterval(() => {
			const isMapContainsUFO = viewportBounds.contains(ufoCoordinates)
			if (!isMapContainsUFO) {
				map.flyTo(ufoCoordinates)
			}
		}, 100)

		return () => clearInterval(testUFOIsInMap)
	}, [ufoCoordinates, viewportBounds, map])

	return null
}

const Map = ({
	ufoCoordinates,
	ufoCoordinatesHistory,
	sendMessageCallback,
}: {
	ufoCoordinates: LatLngExpression
	ufoCoordinatesHistory: LatLngExpression[]
	sendMessageCallback: (message: string) => void
}) => {
	const [isCenterMapOnUFOEnabled, toggleCenterMapOnUFOEnabled] =
		useState<boolean>(false)

	const MarkerRender = useCallback(() => {
		return (
			<Marker position={ufoCoordinates}>
				<UFOMarker />
			</Marker>
		)
	}, [ufoCoordinates])

	const handleOnClickCenterMapOnUFOCheckbox = (
		event: React.InputHTMLAttributes<HTMLInputElement>
	) => {
		toggleCenterMapOnUFOEnabled(!isCenterMapOnUFOEnabled)
	}

	return (
		<MapContainer
			center={[37.272011, -115.815498]}
			zoom={12}
			scrollWheelZoom={false}
			style={mapStyles}
		>
			<TileLayer
				attribution=''
				url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
			/>
			<CustomUFOControlMenu
				position='topright'
				isCenterMapOnUFOEnabled={isCenterMapOnUFOEnabled}
				onChangeCenterMapCallback={(event) =>
					handleOnClickCenterMapOnUFOCheckbox(event)
				}
				onChangeFlyingPatternSelectionCallback={sendMessageCallback}
			/>
			<MarkerLayer>
				<MarkerRender />
			</MarkerLayer>
			{/* The zIndex for markerPane is 600 by default.
			    We are creating a new pane for the Polyline with a lower zIndex to ensure it's rendered underneath. */}
			<Pane name='ufo-path-pane' style={{ zIndex: 390 }}>
				<Polyline
					pathOptions={{
						color: 'green',
						dashArray: [4],
						lineCap: 'round',
						lineJoin: 'round',
					}}
					positions={ufoCoordinatesHistory}
				/>
			</Pane>
			{isCenterMapOnUFOEnabled && (
				<CenterMapOnUFO ufoCoordinates={ufoCoordinates} />
			)}
		</MapContainer>
	)
}

export default memo(Map)
