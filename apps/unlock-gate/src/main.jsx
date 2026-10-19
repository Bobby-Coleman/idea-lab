import { createRoot } from 'react-dom/client'
import '@fontsource-variable/nunito'
import './styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}
