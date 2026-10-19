import { owlSvg } from './owl-svg.js'
export { owlSvg }

export default function Owl({ mood, size = 96, glasses, className = '', style }) {
  return <span className={'owl ' + className} style={{ width: size, height: size, ...style }} dangerouslySetInnerHTML={{ __html: owlSvg({ mood, size, glasses }) }} />
}
