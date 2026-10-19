// Illustrations used as the "photo" inside the demo gifts (no network, no stock photos).
const concert = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1140"/><stop offset=".55" stop-color="#5b1f6e"/><stop offset="1" stop-color="#e2457a"/></linearGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".85"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".62" r=".45"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
</defs>
<rect width="600" height="600" fill="url(#sky)"/>
<g fill="#fff" opacity=".8"><circle cx="60" cy="70" r="2"/><circle cx="150" cy="40" r="1.6"/><circle cx="260" cy="90" r="1.4"/><circle cx="420" cy="50" r="2"/><circle cx="530" cy="110" r="1.6"/><circle cx="350" cy="30" r="1.2"/></g>
<polygon points="300,250 120,600 220,600" fill="url(#beam)" opacity=".55"/>
<polygon points="300,250 380,600 480,600" fill="url(#beam)" opacity=".55"/>
<polygon points="110,0 30,600 200,600" fill="url(#beam)" opacity=".3"/>
<polygon points="490,0 400,600 570,600" fill="url(#beam)" opacity=".3"/>
<rect width="600" height="600" fill="url(#glow)"/>
<rect x="150" y="300" width="300" height="120" rx="8" fill="#2a0f2f"/>
<rect x="160" y="310" width="280" height="12" rx="6" fill="#ffcf6a"/>
<g fill="#1a0820"><circle cx="230" cy="372" r="12"/><rect x="221" y="382" width="18" height="38" rx="8"/><circle cx="300" cy="362" r="13"/><rect x="290" y="374" width="20" height="46" rx="9"/><circle cx="370" cy="372" r="12"/><rect x="361" y="382" width="18" height="38" rx="8"/></g>
<rect x="296" y="380" width="8" height="40" fill="#ffcf6a" opacity=".7"/>
<g fill="#12051a">
<path d="M0 600 V500 q20-40 40-10 q15-60 30-5 l5-60 8 0 4 60 q20-35 40 0 q18-50 36 0 q20-30 42 4 l6-70 9 0 3 70 q22-36 44 0 q18-46 38 0 q20-30 40 0 l8-66 9 0 2 66 q20-40 42-2 q20-44 40 2 q18-30 40 0 q20-46 40 0 l6-58 9 0 3 58 q18-30 38 0 V600z"/>
</g>
<g fill="#ffe08a"><circle cx="78" cy="436" r="5"/><circle cx="219" cy="432" r="5"/><circle cx="361" cy="436" r="5"/><circle cx="510" cy="444" r="5"/></g>
</svg>`

const balloon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<defs>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb6ff"/><stop offset=".45" stop-color="#ffc2c7"/><stop offset=".8" stop-color="#ffb36b"/><stop offset="1" stop-color="#ff8f5a"/></linearGradient>
<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7d6"/><stop offset=".5" stop-color="#ffe08a"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>
</defs>
<rect width="600" height="600" fill="url(#s)"/>
<circle cx="300" cy="470" r="150" fill="url(#sun)"/>
<g fill="#fff" opacity=".55"><ellipse cx="120" cy="150" rx="70" ry="16"/><ellipse cx="470" cy="210" rx="90" ry="18"/><ellipse cx="420" cy="120" rx="40" ry="10"/></g>
<g transform="translate(300 230)">
<path d="M0-130 C75-130 105-70 95-25 C85 25 35 55 22 85 L-22 85 C-35 55-85 25-95-25 C-105-70-75-130 0-130Z" fill="#ff5a5f"/>
<path d="M0-130 C35-130 45-70 42-25 C38 25 15 55 10 85 L-10 85 C-15 55-38 25-42-25 C-45-70-35-130 0-130Z" fill="#ffd166"/>
<path d="M0-130 C12-130 15-70 14-25 C12 25 4 55 3 85 L-3 85 C-4 55-12 25-14-25 C-15-70-12-130 0-130Z" fill="#ff5a5f"/>
<path d="M-22 85 L-14 112 M22 85 L14 112" stroke="#6b3b2a" stroke-width="2.5"/>
<rect x="-16" y="110" width="32" height="24" rx="4" fill="#8a5a3c"/>
</g>
<g transform="translate(130 330) scale(.45)">
<path d="M0-130 C75-130 105-70 95-25 C85 25 35 55 22 85 L-22 85 C-35 55-85 25-95-25 C-105-70-75-130 0-130Z" fill="#4cc9a8"/>
<path d="M0-130 C35-130 45-70 42-25 C38 25 15 55 10 85 L-10 85 C-15 55-38 25-42-25 C-45-70-35-130 0-130Z" fill="#fff4e0"/>
<path d="M-22 85 L-14 112 M22 85 L14 112" stroke="#6b3b2a" stroke-width="4"/><rect x="-16" y="110" width="32" height="24" rx="4" fill="#8a5a3c"/>
</g>
<g transform="translate(480 300) scale(.33)">
<path d="M0-130 C75-130 105-70 95-25 C85 25 35 55 22 85 L-22 85 C-35 55-85 25-95-25 C-105-70-75-130 0-130Z" fill="#7b6cf6"/>
<path d="M0-130 C35-130 45-70 42-25 C38 25 15 55 10 85 L-10 85 C-15 55-38 25-42-25 C-45-70-35-130 0-130Z" fill="#ffd1e8"/>
<path d="M-22 85 L-14 112 M22 85 L14 112" stroke="#6b3b2a" stroke-width="5"/><rect x="-16" y="110" width="32" height="24" rx="4" fill="#8a5a3c"/>
</g>
<path d="M0 520 Q120 440 250 500 T600 470 V600 H0Z" fill="#7a4a6b" opacity=".75"/>
<path d="M0 560 Q160 500 330 550 T600 530 V600 H0Z" fill="#4a2c4f"/>
</svg>`

const camera = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
<rect width="600" height="600" fill="#ffd9cf"/>
<circle cx="470" cy="120" r="70" fill="#ffc4b5"/><circle cx="110" cy="500" r="90" fill="#ffc4b5"/>
<g transform="translate(300 310)">
<rect x="-170" y="-130" width="340" height="260" rx="44" fill="#fffaf2"/>
<rect x="-170" y="40" width="340" height="90" rx="0" fill="#f3e6d6"/>
<rect x="-170" y="90" width="340" height="40" rx="0" fill="#f3e6d6"/>
<path d="M-170 86 h340 v0 a44 44 0 0 1 -44 44 h-252 a44 44 0 0 1 -44-44z" fill="#f3e6d6"/>
<g><rect x="-170" y="-40" width="340" height="14" fill="#ff6b5b"/><rect x="-170" y="-26" width="340" height="14" fill="#ffb347"/><rect x="-170" y="-12" width="340" height="14" fill="#ffd93d"/><rect x="-170" y="2" width="340" height="14" fill="#5cc58b"/><rect x="-170" y="16" width="340" height="14" fill="#4aa3df"/></g>
<circle cx="0" cy="-10" r="92" fill="#2b2b33"/><circle cx="0" cy="-10" r="70" fill="#14141a"/><circle cx="0" cy="-10" r="44" fill="#2e3550"/><circle cx="-14" cy="-26" r="13" fill="#fff" opacity=".7"/>
<rect x="-140" y="-112" width="56" height="40" rx="10" fill="#2b2b33"/><circle cx="120" cy="-90" r="16" fill="#ff6b5b"/>
</g>
<g transform="translate(400 410) rotate(10)"><rect x="0" y="0" width="120" height="140" rx="6" fill="#fff"/><rect x="12" y="12" width="96" height="92" fill="#8fc7ff"/><circle cx="60" cy="70" r="18" fill="#ffd166"/></g>
</svg>`

const ART = { concert, balloon, camera }
export const artSrc = (key) => (ART[key] ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ART[key]) : null)
