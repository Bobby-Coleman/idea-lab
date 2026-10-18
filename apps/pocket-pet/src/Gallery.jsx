import Pet from './Pet.jsx';
import { SAMPLES } from './data.js';

const EXPR = ['idle', 'happy', 'love', 'eat', 'sleep', 'sad', 'meh', 'surprised', 'wink'];
const PATS = ['solid', 'tabby', 'tux', 'patch', 'spots'];
const BLACK = { base: '#2a2630', second: '#f4efe9', iris: '#f5c443' };

export default function Gallery() {
  return (
    <div style={{ background: '#fff6ec', padding: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {SAMPLES.map((s) => EXPR.map((e) => (
        <div key={s.name + e} style={{ width: 120 }}><Pet {...s} expr={e} animated={false} /><small>{s.species} {e}</small></div>
      )))}
      {['cat', 'dog', 'bunny'].map((sp) => PATS.map((p) => (
        <div key={sp + p} style={{ width: 120 }}><Pet species={sp} colors={p === 'tux' ? BLACK : { base: '#9aa0ad', second: '#5b5f6b', iris: '#2b2233' }} pattern={p} animated={false} /><small>{sp} {p}</small></div>
      )))}
      {['party', 'bow', 'flowers', 'cowboy', 'crown', 'chef', 'halo'].map((h, i) => (
        <div key={h} style={{ width: 120 }}><Pet {...SAMPLES[i % 3]} outfit={{ head: h, face: ['freckles', 'glasses', 'shades'][i % 3], neck: ['bowtie', 'bell', 'bandana', 'scarf', 'pearls'][i % 5] }} animated={false} /><small>{h}</small></div>
      ))}
      <div style={{ width: 160 }}><Pet {...SAMPLES[0]} expr="love" sticker caption="love u" animated={false} /></div>
      <div style={{ width: 160 }}><Pet {...SAMPLES[1]} expr="happy" crop="head" outfit={{ head: 'crown' }} animated={false} /></div>
    </div>
  );
}

export function IconArt() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'radial-gradient(circle at 50% 35%, #ffb59a, #ff7a59 70%)', display: 'grid', placeItems: 'end center', overflow: 'hidden' }}>
      <div style={{ width: '92%', marginBottom: '-30%' }}>
        <Pet {...SAMPLES[0]} expr="happy" animated={false} />
      </div>
    </div>
  );
}
