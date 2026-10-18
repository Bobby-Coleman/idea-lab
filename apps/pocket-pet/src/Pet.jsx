import { useId } from 'react';
import { darken, lighten, mix, lum } from './lib/color.js';

const INK = '#3b2e3a';
const PINK = '#ffb3c4';

function heart(cx, cy, s, fill, extra = {}) {
  const d = `M${cx} ${cy + 6 * s} C${cx - 14 * s} ${cy - 4 * s} ${cx - 8 * s} ${cy - 14 * s} ${cx} ${cy - 7 * s} C${cx + 8 * s} ${cy - 14 * s} ${cx + 14 * s} ${cy - 4 * s} ${cx} ${cy + 6 * s} Z`;
  return <path d={d} fill={fill} {...extra} />;
}

function Eye({ x, y, iris, expr, side, lid }) {
  const dark = '#1d1626';
  const colored = lum(iris) > 0.08;
  const stroke = { stroke: INK, strokeWidth: 4.5, strokeLinecap: 'round', fill: 'none' };
  if (expr === 'happy' || expr === 'eat' || (expr === 'wink' && side === 'r'))
    return <path d={`M${x - 10} ${y + 3} Q${x} ${y - 10} ${x + 10} ${y + 3}`} {...stroke} />;
  if (expr === 'sleep')
    return <path d={`M${x - 10} ${y} Q${x} ${y + 8} ${x + 10} ${y}`} {...stroke} />;
  if (expr === 'love') return heart(x, y + 1, 1.05, '#ff4f7b', { stroke: '#c92a55', strokeWidth: 1.5 });
  const big = expr === 'surprised';
  const rx = big ? 12 : 11, ry = big ? 14 : 13;
  return (
    <g className="pp-blink">
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={colored ? iris : dark} />
      {colored && <ellipse cx={x} cy={y + 1} rx={big ? 3 : 5} ry={big ? 6 : 9} fill={dark} />}
      {big && !colored && <ellipse cx={x} cy={y} rx={rx - 4} ry={ry - 4} fill="#fff" opacity="0.15" />}
      <circle cx={x + 4} cy={y - 5} r={expr === 'sad' ? 3 : 4.4} fill="#fff" />
      <circle cx={x - 4} cy={y + 5} r={2} fill="#fff" opacity="0.85" />
      {expr === 'meh' && (
        <path d={`M${x - 13} ${y - 15} L${x + 13} ${y - 15} L${x + 13} ${y - 1} Q${x} ${y + 1} ${x - 13} ${y - 1} Z`}
          fill={lid} />
      )}
      {expr === 'meh' && <path d={`M${x - 12} ${y - 1} Q${x} ${y + 1} ${x + 12} ${y - 1}`} {...stroke} strokeWidth="3.5" />}
    </g>
  );
}

function Mouth({ species, expr, y, outline }) {
  const line = { stroke: outline, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  const teeth = species === 'bunny';
  if (expr === 'happy' || expr === 'love' || expr === 'wink' || expr === 'surprised-open') {
    return (
      <g>
        <path d={`M89 ${y} Q100 ${y + 15} 111 ${y} Z`} fill="#7a2f45" stroke={outline} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={`M94 ${y + 6} Q100 ${y + 2} 106 ${y + 6} Q103 ${y + 11} 100 ${y + 11} Q97 ${y + 11} 94 ${y + 6} Z`} fill="#ff8fa3" />
        {teeth && <rect x="96" y={y} width="8" height="4.5" rx="1" fill="#fff" />}
      </g>
    );
  }
  if (expr === 'eat') {
    return (
      <g className="pp-chomp">
        <ellipse cx="100" cy={y + 4} rx="9" ry="7" fill="#7a2f45" stroke={outline} strokeWidth="2.5" />
        <ellipse cx="100" cy={y + 7} rx="5" ry="3" fill="#ff8fa3" />
      </g>
    );
  }
  if (expr === 'surprised') return <ellipse cx="100" cy={y + 4} rx="4.5" ry="5.5" fill="#7a2f45" stroke={outline} strokeWidth="2.5" />;
  if (expr === 'sad') return <path d={`M92 ${y + 6} Q100 ${y} 108 ${y + 6}`} {...line} />;
  if (expr === 'meh') return <path d={`M93 ${y + 3} L107 ${y + 3}`} {...line} />;
  return (
    <g>
      <path d={`M100 ${y - 3} L100 ${y}`} {...line} />
      <path d={`M91 ${y} Q95.5 ${y + 6} 100 ${y} Q104.5 ${y + 6} 109 ${y}`} {...line} />
      {teeth && (
        <g>
          <rect x="95.5" y={y + 2.2} width="9" height="6.5" rx="1.5" fill="#fff" stroke={outline} strokeWidth="1.6" />
          <path d={`M100 ${y + 2.5} L100 ${y + 8.5}`} stroke={outline} strokeWidth="1.2" />
        </g>
      )}
    </g>
  );
}

export function Accessory({ id }) {
  const o = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' };
  switch (id) {
    case 'party':
      return (
        <g transform="rotate(14 120 40)">
          <path d="M104 44 L121 -6 L138 44 Q121 50 104 44 Z" fill="#7cc6fe" {...o} />
          <path d="M110 27 Q121 31 132 27" stroke="#fff" strokeWidth="4" fill="none" />
          <path d="M115 12 Q121 15 127 12" stroke="#ffd166" strokeWidth="4" fill="none" />
          <circle cx="121" cy="-8" r="7" fill="#ff6b9a" {...o} />
        </g>
      );
    case 'bow':
      return (
        <g transform="translate(138 52) rotate(18)">
          <path d="M0 0 Q-24 -22 -26 0 Q-24 22 0 0 Z" fill="#ff6b9a" {...o} />
          <path d="M0 0 Q24 -22 26 0 Q24 22 0 0 Z" fill="#ff6b9a" {...o} />
          <path d="M-12 -6 Q-16 0 -12 6 M12 -6 Q16 0 12 6" stroke="#c9325f" strokeWidth="2" fill="none" />
          <circle cx="0" cy="0" r="7" fill="#ff8fb3" {...o} />
        </g>
      );
    case 'flowers': {
      const spots = [[52, 66, '#ff8fb3'], [72, 49, '#fff'], [100, 42, '#c7b5ff'], [128, 49, '#fff'], [148, 66, '#ff8fb3']];
      return (
        <g>
          <path d="M48 70 Q100 30 152 70" stroke="#6cc28b" strokeWidth="5" fill="none" strokeLinecap="round" />
          {[[62, 54], [86, 43], [114, 43], [138, 54]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="6" ry="3.5" fill="#7fd39b" stroke="#3f8f5c" strokeWidth="1.5" transform={`rotate(${i < 2 ? -30 : 30} ${x} ${y})`} />
          ))}
          {spots.map(([x, y, c], i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 6} cy={y + Math.sin((a * Math.PI) / 180) * 6} r="5" fill={c} stroke={INK} strokeWidth="1.5" />
              ))}
              <circle cx={x} cy={y} r="3.6" fill="#ffd166" stroke={INK} strokeWidth="1.2" />
            </g>
          ))}
        </g>
      );
    }
    case 'cowboy':
      return (
        <g>
          <path d="M70 46 Q68 6 100 12 Q132 6 130 46 Z" fill="#b97a4a" {...o} />
          <path d="M71 36 Q100 42 129 36 L130 44 Q100 50 70 44 Z" fill="#7a4a2a" />
          <path d="M38 46 Q40 36 64 42 Q100 52 136 42 Q160 36 162 46 Q160 58 100 58 Q40 58 38 46 Z" fill="#c98b58" {...o} />
          <path d="M100 18 L100 34" stroke="#94603a" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path d="M72 48 L68 16 L86 32 L100 8 L114 32 L132 16 L128 48 Q100 54 72 48 Z" fill="#ffcf4a" stroke="#b07a12" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M73 42 Q100 47 127 42" stroke="#f0a91d" strokeWidth="3" fill="none" />
          <circle cx="100" cy="36" r="5" fill="#ff5d8f" stroke="#b07a12" strokeWidth="1.5" />
          <circle cx="83" cy="40" r="3.5" fill="#7cc6fe" stroke="#b07a12" strokeWidth="1.2" />
          <circle cx="117" cy="40" r="3.5" fill="#7cc6fe" stroke="#b07a12" strokeWidth="1.2" />
          <circle cx="100" cy="8" r="3.5" fill="#fff6c8" />
        </g>
      );
    case 'chef':
      return (
        <g>
          <path d="M74 50 L74 32 Q58 28 64 12 Q70 -2 86 6 Q94 -8 110 2 Q124 -6 132 8 Q144 16 128 32 L128 50 Q100 56 74 50 Z" fill="#fff" stroke="#9a8f9c" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M74 38 Q100 44 128 38" stroke="#e3dde6" strokeWidth="3" fill="none" />
          <path d="M92 14 Q94 26 92 32 M108 12 Q110 24 108 32" stroke="#e3dde6" strokeWidth="2.5" fill="none" />
        </g>
      );
    case 'halo':
      return (
        <g className="pp-float">
          <ellipse cx="100" cy="4" rx="34" ry="9" fill="none" stroke="#fff3b0" strokeWidth="11" opacity="0.6" />
          <ellipse cx="100" cy="4" rx="34" ry="9" fill="none" stroke="#ffcf4a" strokeWidth="5.5" />
        </g>
      );
    case 'freckles':
      return (
        <g fill="#c4775a" opacity="0.75">
          {[[52, 110], [58, 116], [50, 118], [148, 110], [142, 116], [150, 118]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" />)}
        </g>
      );
    case 'glasses':
      return (
        <g fill="rgba(255,255,255,0.18)" stroke={INK} strokeWidth="4">
          <circle cx="74" cy="100" r="17" />
          <circle cx="126" cy="100" r="17" />
          <path d="M91 98 Q100 92 109 98" fill="none" />
          <path d="M57 96 L42 90 M143 96 L158 90" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'shades':
      return (
        <g>
          {heart(74, 101, 1.75, '#ff4f7b', { stroke: INK, strokeWidth: 3, opacity: 0.95 })}
          {heart(126, 101, 1.75, '#ff4f7b', { stroke: INK, strokeWidth: 3, opacity: 0.95 })}
          <path d="M89 96 Q100 90 111 96" stroke={INK} strokeWidth="3.5" fill="none" />
          <path d="M66 92 Q70 88 76 90" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M118 92 Q122 88 128 90" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
      );
    case 'bowtie':
      return (
        <g transform="translate(100 156)">
          <path d="M0 0 L-22 -11 Q-26 0 -22 11 Z" fill="#5b8def" {...o} />
          <path d="M0 0 L22 -11 Q26 0 22 11 Z" fill="#5b8def" {...o} />
          <rect x="-6" y="-6" width="12" height="12" rx="4" fill="#83aaf5" {...o} />
        </g>
      );
    case 'bell':
      return (
        <g>
          <path d="M58 140 Q100 168 142 140" stroke={INK} strokeWidth="11" fill="none" strokeLinecap="round" />
          <path d="M58 140 Q100 168 142 140" stroke="#ff5d6c" strokeWidth="7" fill="none" strokeLinecap="round" />
          <circle cx="100" cy="162" r="8.5" fill="#ffcf4a" stroke="#b07a12" strokeWidth="2.5" />
          <path d="M94 164 L106 164" stroke="#b07a12" strokeWidth="2" />
          <circle cx="97" cy="159" r="2" fill="#fff6c8" />
        </g>
      );
    case 'bandana':
      return (
        <g>
          <path d="M60 138 Q100 162 140 138 L100 186 Z" fill="#ff6b6b" {...o} />
          {[[100, 160], [88, 152], [112, 152], [100, 174], [76, 146], [124, 146]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill="#fff" />)}
        </g>
      );
    case 'scarf':
      return (
        <g>
          <path d="M118 148 L136 152 L132 190 L114 186 Z" fill="#8bd3b5" {...o} />
          <path d="M116 166 L134 170 M115 176 L133 180" stroke="#fff" strokeWidth="4" />
          <path d="M56 136 Q100 170 144 136 L146 150 Q100 182 54 150 Z" fill="#8bd3b5" {...o} />
          <path d="M70 148 Q100 168 130 148" stroke="#fff" strokeWidth="4" fill="none" strokeDasharray="8 8" />
        </g>
      );
    case 'pearls':
      return (
        <g>
          {Array.from({ length: 11 }).map((_, i) => {
            const t = i / 10;
            const x = 62 + t * 76;
            const y = 142 + Math.sin(t * Math.PI) * 20;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5.2" fill="#fffaf2" stroke="#b8aab9" strokeWidth="1.5" />
                <circle cx={x - 1.5} cy={y - 1.5} r="1.6" fill="#fff" />
              </g>
            );
          })}
        </g>
      );
    default:
      return null;
  }
}

/**
 * The chibi buddy. Everything is parametric so a "scan" just picks colors + pattern.
 * expr: idle | happy | love | sleep | sad | eat | meh | surprised | wink
 */
export default function Pet({
  species = 'cat', colors, pattern = 'solid', expr = 'idle', outfit = {}, animated = true,
  crop = 'full', sticker = false, caption, className = '', style,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const base = colors.base;
  const second = colors.second;
  const iris = colors.iris || '#2b2233';
  const outline = lum(base) < 0.05 ? mix(base, '#000', 0.6) : mix(darken(base, 0.5), INK, 0.45);
  const belly = pattern === 'tux' ? second : mix(lighten(base, 0.38), '#fff3e3', 0.3);
  const ear = species === 'dog' ? (pattern === 'solid' || pattern === 'tux' ? darken(base, 0.14) : second) : base;
  const paw = pattern === 'tux' ? second : lighten(base, 0.12);
  const stripe = pattern === 'tabby' ? second : darken(base, 0.22);
  const o = { stroke: outline, strokeWidth: 3.2, strokeLinejoin: 'round' };
  const mouthY = species === 'dog' ? 124 : 119;

  const viewBox = crop === 'head' ? '18 -24 164 186' : sticker ? '-14 -40 228 306' : '0 -32 200 246';
  const anim = animated ? 'pp-anim' : '';

  const tail = {
    cat: (
      <g className="pp-tail" style={{ transformOrigin: '140px 176px' }}>
        <path d="M134 178 Q178 184 172 146 Q168 120 182 108" stroke={outline} strokeWidth="17" fill="none" strokeLinecap="round" />
        <path d="M134 178 Q178 184 172 146 Q168 120 182 108" stroke={base} strokeWidth="11" fill="none" strokeLinecap="round" />
        {pattern === 'tabby' && <path d="M170 128 L178 132 M172 148 L181 147 M164 172 L170 179" stroke={stripe} strokeWidth="4" strokeLinecap="round" />}
        {pattern === 'tux' && <path d="M177 118 Q179 112 182 108" stroke={second} strokeWidth="11" strokeLinecap="round" fill="none" />}
      </g>
    ),
    dog: (
      <g className="pp-tail pp-tail-fast" style={{ transformOrigin: '138px 166px' }}>
        <path d="M136 166 Q162 158 164 128" stroke={outline} strokeWidth="18" fill="none" strokeLinecap="round" />
        <path d="M136 166 Q162 158 164 128" stroke={base} strokeWidth="12" fill="none" strokeLinecap="round" />
        {pattern !== 'solid' && <path d="M163.5 136 L164 128" stroke={pattern === 'tux' ? second : ear} strokeWidth="12" strokeLinecap="round" />}
      </g>
    ),
    bunny: (
      <g className="pp-tail" style={{ transformOrigin: '142px 180px' }}>
        <circle cx="142" cy="178" r="15" fill={lighten(belly, 0.3)} {...o} />
        <path d="M134 172 Q138 168 144 170" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
    ),
  }[species];

  const earsBehind = species === 'cat' ? (
    <g className="pp-ears">
      <g>
        <path d="M44 76 Q34 30 48 13 Q55 6 64 13 L98 44 Z" fill={pattern === 'patch' ? second : base} {...o} />
        <path d="M53 64 Q47 34 55 24 Q59 20 65 25 L86 46 Z" fill={PINK} />
      </g>
      <g className="pp-ear-twitch" style={{ transformOrigin: '130px 50px' }}>
        <path d="M156 76 Q166 30 152 13 Q145 6 136 13 L102 44 Z" fill={base} {...o} />
        <path d="M147 64 Q153 34 145 24 Q141 20 135 25 L114 46 Z" fill={PINK} />
      </g>
    </g>
  ) : species === 'bunny' ? (
    <g className="pp-ears">
      <g transform="rotate(-12 74 62)">
        <ellipse cx="74" cy="16" rx="16" ry="46" fill={pattern === 'patch' ? second : base} {...o} />
        <ellipse cx="74" cy="20" rx="8" ry="33" fill={PINK} />
      </g>
      <g className="pp-ear-twitch" style={{ transformOrigin: '126px 62px' }}>
        <g transform="rotate(12 126 62)">
          <ellipse cx="126" cy="16" rx="16" ry="46" fill={base} {...o} />
          <ellipse cx="126" cy="20" rx="8" ry="33" fill={PINK} />
        </g>
      </g>
    </g>
  ) : null;

  const earsFront = species === 'dog' ? (
    <g>
      <g className="pp-flop-l" style={{ transformOrigin: '60px 56px' }}>
        <path d="M54 50 Q20 48 17 92 Q14 128 40 130 Q56 128 58 100 Q60 72 70 56 Z" fill={ear} {...o} />
      </g>
      <g className="pp-flop-r" style={{ transformOrigin: '140px 56px' }}>
        <path d="M146 50 Q180 48 183 92 Q186 128 160 130 Q144 128 142 100 Q140 72 130 56 Z" fill={ear} {...o} />
      </g>
    </g>
  ) : null;

  const headPattern = {
    solid: null,
    tabby: (
      <g stroke={stripe} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M100 41 L100 60" />
        <path d="M86 43 L90 58" />
        <path d="M114 43 L110 58" />
        <path d="M37 92 L52 95" />
        <path d="M37 103 L51 104" />
        <path d="M163 92 L148 95" />
        <path d="M163 103 L149 104" />
      </g>
    ),
    tux: (
      <g fill={second}>
        <ellipse cx="100" cy="134" rx="36" ry="27" />
        <path d="M92 39 Q100 92 108 39 Z" />
      </g>
    ),
    patch: <circle cx="66" cy="84" r="34" fill={second} />,
    spots: (
      <g fill={second}>
        <circle cx="60" cy="74" r="10" />
        <circle cx="136" cy="64" r="7" />
        <circle cx="150" cy="94" r="6" />
        <circle cx="118" cy="50" r="5" />
      </g>
    ),
  }[pattern];

  const bodyPattern = {
    tabby: (
      <g stroke={stripe} strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M60 150 Q66 152 70 160" />
        <path d="M140 150 Q134 152 130 160" />
        <path d="M58 166 Q64 168 66 176" />
        <path d="M142 166 Q136 168 134 176" />
      </g>
    ),
    patch: <circle cx="130" cy="158" r="18" fill={second} />,
    spots: (
      <g fill={second}>
        <circle cx="66" cy="160" r="7" />
        <circle cx="134" cy="170" r="9" />
      </g>
    ),
  }[pattern];

  const body = (
    <g>
      {/* back feet */}
      <ellipse cx="66" cy="192" rx="14" ry="11" fill={paw} {...o} />
      <ellipse cx="134" cy="192" rx="14" ry="11" fill={paw} {...o} />
      <ellipse cx="100" cy="162" rx="47" ry="39" fill={base} {...o} />
      <g clipPath={`url(#body${uid})`}>
        {bodyPattern}
        <ellipse cx="100" cy="172" rx="27" ry="26" fill={belly} />
      </g>
      <g>
        <ellipse cx="83" cy="194" rx="13" ry="9.5" fill={paw} {...o} />
        <ellipse cx="117" cy="194" rx="13" ry="9.5" fill={paw} {...o} />
        <path d="M80 191 L80 197 M86 191 L86 197 M114 191 L114 197 M120 191 L120 197" stroke={outline} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      </g>
    </g>
  );

  const head = (
    <g>
      <ellipse cx="100" cy="96" rx="64" ry="56" fill={base} {...o} />
      <g clipPath={`url(#head${uid})`}>
        {headPattern}
        {species === 'dog' && <ellipse cx="100" cy="124" rx="24" ry="16" fill={pattern === 'tux' ? second : belly} />}
      </g>
      <ellipse cx="100" cy="96" rx="64" ry="56" fill="none" {...o} />
      {/* soft top highlight */}
      <ellipse cx="82" cy="58" rx="24" ry="9" fill="#fff" opacity="0.22" transform="rotate(-14 82 58)" />
      <ellipse cx="57" cy="117" rx="10" ry="6" fill="#ff7f9c" opacity={expr === 'love' || expr === 'happy' ? 0.6 : 0.4} />
      <ellipse cx="143" cy="117" rx="10" ry="6" fill="#ff7f9c" opacity={expr === 'love' || expr === 'happy' ? 0.6 : 0.4} />
      {expr === 'sad' && (
        <g stroke={outline} strokeWidth="3.5" strokeLinecap="round">
          <path d="M62 85 L82 80" />
          <path d="M138 85 L118 80" />
        </g>
      )}
      <Eye x={74} y={100} iris={iris} expr={expr} side="l" lid={base} />
      <Eye x={126} y={100} iris={iris} expr={expr} side="r" lid={base} />
      {expr === 'sad' && <path d="M64 114 Q60 122 64 126 Q68 122 64 114 Z" fill="#8fd3ff" stroke="#4aa6dd" strokeWidth="1.5" />}
      {species === 'dog' ? (
        <g>
          <ellipse cx="100" cy="113" rx="9" ry="6.5" fill="#2b2233" />
          <ellipse cx="97" cy="111" rx="3" ry="1.8" fill="#fff" opacity="0.7" />
        </g>
      ) : (
        <path d="M95 112 Q100 109 105 112 Q103 117 100 117.5 Q97 117 95 112 Z" fill="#f2879f" stroke={outline} strokeWidth="1.6" strokeLinejoin="round" />
      )}
      <Mouth species={species} expr={expr} y={mouthY} outline={outline} />
      {species === 'cat' && (
        <g stroke={outline} strokeWidth="2" strokeLinecap="round" opacity="0.55">
          <path d="M44 112 L22 108" />
          <path d="M44 119 L22 122" />
          <path d="M156 112 L178 108" />
          <path d="M156 119 L178 122" />
        </g>
      )}
    </g>
  );

  const content = (
    <>
      {!sticker && crop !== 'head' && <ellipse cx="100" cy="206" rx="54" ry="8" fill="#000" opacity="0.1" />}
      <g className={animated ? 'pp-breathe' : ''}>
        {crop !== 'head' && tail}
        {crop !== 'head' && body}
        {crop === 'head' && <ellipse cx="100" cy="162" rx="47" ry="39" fill={base} {...o} />}
        {earsBehind}
        {head}
        {earsFront}
        {outfit.neck && <Accessory id={outfit.neck} />}
        {outfit.face && <Accessory id={outfit.face} />}
        {outfit.head && <Accessory id={outfit.head} />}
        {expr === 'sleep' && animated && (
          <g className="pp-zzz" fill={INK} fontWeight="900" fontFamily="Nunito, ui-rounded, system-ui">
            <text x="150" y="40" fontSize="20">z</text>
            <text x="166" y="20" fontSize="26">Z</text>
          </g>
        )}
      </g>
    </>
  );

  return (
    <svg viewBox={viewBox} className={`pp-svg ${anim} ${crop === 'head' ? 'crop-head' : ''} ${className}`} style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id={`head${uid}`}><ellipse cx="100" cy="96" rx="64" ry="56" /></clipPath>
        <clipPath id={`body${uid}`}><ellipse cx="100" cy="162" rx="47" ry="39" /></clipPath>
        {sticker && (
          <filter id={`stk${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="7" result="d" />
            <feFlood floodColor="#ffffff" />
            <feComposite in2="d" operator="in" result="w" />
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#3b2e3a" floodOpacity="0.25" in="w" result="s" />
            <feMerge><feMergeNode in="s" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
      </defs>
      {sticker ? (
        <g filter={`url(#stk${uid})`}>
          {content}
          {caption && (
            <text x="100" y="244" textAnchor="middle" fontSize="34" fontWeight="900" fontFamily="Nunito, ui-rounded, system-ui"
              fill="#ff5d8f" stroke="#3b2e3a" strokeWidth="2" paintOrder="stroke" transform="rotate(-4 100 236)">{caption}</text>
          )}
        </g>
      ) : content}
    </svg>
  );
}
