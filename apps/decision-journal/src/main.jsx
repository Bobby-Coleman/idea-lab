import { createRoot } from 'react-dom/client'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/inter'
import './styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}
