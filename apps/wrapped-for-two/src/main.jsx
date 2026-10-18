import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/inter'
import './styles.css'
import App from './App'
import { initStore } from './lib/store'

initStore().then(() => createRoot(document.getElementById('root')).render(<App />))
