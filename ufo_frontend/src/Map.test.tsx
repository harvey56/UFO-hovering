import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { LatLng } from 'leaflet'
import { useMap } from 'react-leaflet'
import { CenterMapOnUFO, CustomUFOControlMenu } from './Map'

describe('CustomUFOControlMenu', () => {
	const onChangeCenterMapCallback = vi.fn()
	const onChangeFlyingPatternSelectionCallback = vi.fn()

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('renders correctly', () => {
		const { getByText } = render(
			<CustomUFOControlMenu
				position='bottomleft'
				isCenterMapOnUFOEnabled={true}
				onChangeCenterMapCallback={onChangeCenterMapCallback}
				onChangeFlyingPatternSelectionCallback={
					onChangeFlyingPatternSelectionCallback
				}
			/>
		)

		expect(getByText('Center map on UFO')).toBeInTheDocument()
		expect(getByText('Select UFO flying pattern')).toBeInTheDocument()
	})

	it('calls onChangeCenterMapCallback when checkbox is clicked', () => {
		const { getByLabelText } = render(
			<CustomUFOControlMenu
				position='bottomleft'
				isCenterMapOnUFOEnabled={true}
				onChangeCenterMapCallback={onChangeCenterMapCallback}
				onChangeFlyingPatternSelectionCallback={
					onChangeFlyingPatternSelectionCallback
				}
			/>
		)

		const checkbox = getByLabelText('Center map on UFO')
		fireEvent.click(checkbox)

		expect(onChangeCenterMapCallback).toHaveBeenCalledTimes(1)
	})
})

vi.mock('react-leaflet', () => ({
	useMap: () => ({
		getBounds: () => ({
			contains: vi.fn(() => {
				return {
					_northEast: { lat: -37.49229177375265, lng: -115.23760455506873 },
					_southWest: { lat: -37.53858972582635, lng: -115.27881778138706 },
				}
			}),
		}),
		flyTo: vi.fn(),
	}),
}))

describe('CenterMapOnUFO', () => {
	const ufoCoordinates = new LatLng(-37.34171557621005, -115.13485860640995)

	it('should not center the map if the UFO is within the viewport', () => {
		vi.spyOn(useMap().getBounds(), 'contains').mockReturnValue(true)

		render(<CenterMapOnUFO ufoCoordinates={ufoCoordinates} />)

		expect(useMap().flyTo).not.toHaveBeenCalled()
	})
})
