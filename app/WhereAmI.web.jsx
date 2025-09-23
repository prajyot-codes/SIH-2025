import React, { useEffect, useState, useRef } from 'react'

// We'll use Leaflet via CDN to avoid installing react-leaflet and peer dependency issues.
export default function WhereAmIWeb() {
  const [position, setPosition] = useState(null)
  const [reports, setReports] = useState([])
  const mapRef = useRef(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => {
          console.error(err)
          setPosition([51.505, -0.09])
        }
      )
    } else {
      setPosition([51.505, -0.09])
    }
  }, [])

  useEffect(() => {
    if (!position) return

    // Load Leaflet CSS
    const cssId = 'leaflet-css'
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link')
      link.id = cssId
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Load Leaflet JS
    const scriptId = 'leaflet-js'
    function initMap() {
      // eslint-disable-next-line no-undef
      const L = window.L
      if (!L) return

      if (mapRef.current && mapRef.current._leaflet_id) {
        mapRef.current.setView(position, 13)
        return
      }

      mapRef.current = L.map('whereami-map').setView(position, 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current)

      const userMarker = L.marker(position).addTo(mapRef.current).bindPopup('You are here')

      // Add existing reports
      reports.forEach(r => L.marker([r.lat, r.lng], { title: r.animalType }).addTo(mapRef.current).bindPopup(`<strong>${r.animalType}</strong><br/>${r.description}`))
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js'
      script.onload = initMap
      document.body.appendChild(script)
    } else {
      initMap()
    }

    return () => {
      if (mapRef.current && mapRef.current.remove) mapRef.current.remove()
      mapRef.current = null
    }
  }, [position, reports])

  const handleReport = (e) => {
    e.preventDefault()
    const form = e.target
    const animalType = form.animalType.value
    const description = form.description.value
    if (!position) return alert('Position not available')
    const report = { animalType, description, lat: position[0], lng: position[1] }
    setReports(prev => [...prev, report])
    form.reset()
  }

  if (!position) return <div style={{padding:16}}><h2>Map</h2><p>Fetching your location...</p></div>

  return (
    <div style={{ padding: 16 }}>
      <h2>Where Am I (Web)</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div id="whereami-map" style={{ height: '60vh', width: '100%' }} />
        </div>
        <div style={{ width: 320 }}>
          <h3>Report</h3>
          <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input name="animalType" placeholder="Report title" />
            <textarea name="description" placeholder="Description" rows={3} />
            <button type="submit">Report at my location</button>
          </form>
          <h3 style={{ marginTop: 16 }}>Reports</h3>
          <ul>
            {reports.map((r, i) => (
              <li key={i}>{r.animalType} — {r.description}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
