import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store.jsx';
import { TabBar, Toast, Confetti } from './ui.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Closet from './screens/Closet.jsx';
import Stickers from './screens/Stickers.jsx';
import Journal from './screens/Journal.jsx';
import { Paywall, Profile, WidgetPreview, Partner } from './Sheets.jsx';

function useRoute() {
  const get = () => (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0];
  const [r, setR] = useState(get);
  useEffect(() => {
    const f = () => setR(get());
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return r;
}

function Shell() {
  const { pet, setSheet } = useStore();
  const route = useRoute();
  useEffect(() => { setSheet(null); }, [route, setSheet]);
  let body;
  if (!pet) body = <Onboarding />;
  else if (route === 'add') body = <Onboarding adding onCancel={() => (location.hash = '#/home')} />;
  else {
    const Screen = { closet: Closet, stickers: Stickers, journal: Journal }[route] || Home;
    const tab = ['closet', 'stickers', 'journal'].includes(route) ? route : 'home';
    body = (
      <>
        <main className="main"><Screen key={pet.id + tab} /></main>
        <TabBar route={tab} />
      </>
    );
  }
  return (
    <div className="app">
      {body}
      <Paywall />
      <Profile />
      <WidgetPreview />
      <Partner />
      <Confetti />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
