import { createRoot } from 'react-dom/client'
import '@fontsource/lilita-one/latin-400.css'
import '@fontsource/nunito/latin-600.css'
import '@fontsource/nunito/latin-800.css'
import './styles.css'
import App from './App.jsx'

// make sure the canvas fonts are ready before the first frame
document.fonts?.load('20px "Lilita One"').finally(() => {
  createRoot(document.getElementById('root')).render(<App />)
})

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}

// no pinch zoom or double-tap zoom in the standalone app
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('dblclick', (e) => e.preventDefault())
