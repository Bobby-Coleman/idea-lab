import { createRoot } from 'react-dom/client'
import '@fontsource/luckiest-guy/latin-400.css'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-800.css'
import '@fontsource/nunito/latin-900.css'
import './styles.css'
import App from './App.jsx'

// make sure the canvas fonts are ready before the first frame
Promise.race([document.fonts?.load('20px "Luckiest Guy"'), new Promise((r) => setTimeout(r, 1500))]).finally(() => {
  createRoot(document.getElementById('root')).render(<App />)
})

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}

// no pinch zoom, double-tap zoom or rubber-banding in the standalone app
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('dblclick', (e) => e.preventDefault())
document.addEventListener('touchmove', (e) => { if (!e.target.closest('.scroll')) e.preventDefault() }, { passive: false })
