import { createRoot } from 'react-dom/client';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import './styles.css';
import App from './App.jsx';
import Gallery, { IconArt } from './Gallery.jsx';

const root = createRoot(document.getElementById('root'));
root.render(location.hash === '#/gallery' ? <Gallery /> : location.hash === '#/icon' ? <IconArt /> : <App />);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  try {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  } catch {}
}
