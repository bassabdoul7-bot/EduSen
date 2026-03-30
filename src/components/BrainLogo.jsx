import { GraduationCap } from 'lucide-react'

export default function BrainLogo({ size = 'sm', className = '' }) {
  const sizes = {
    xs: { text: 'text-base', cap: 13, capStyle: { top: '-10px', left: '-1px' } },
    sm: { text: 'text-xl', cap: 17, capStyle: { top: '-13px', left: '-1px' } },
    md: { text: 'text-3xl', cap: 22, capStyle: { top: '-18px', left: '-2px' } },
    lg: { text: 'text-5xl', cap: 32, capStyle: { top: '-26px', left: '-3px' } },
    xl: { text: 'text-6xl', cap: 40, capStyle: { top: '-34px', left: '-4px' } },
  }
  const s = sizes[size] || sizes.sm
  const logoFont = { fontFamily: "'Clash Display', 'Satoshi', sans-serif" }

  return (
    <div className={`inline-flex items-baseline ${className}`} style={logoFont}>
      <span className="relative">
        <GraduationCap size={s.cap} className="absolute text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" strokeWidth={2.5} style={s.capStyle} />
        <span className={`${s.text} font-bold text-senegal-green`}>K</span>
      </span>
      <span className={`${s.text} font-bold text-senegal-green`}>a</span>
      <span className={`${s.text} font-bold text-senegal-yellow`}>n</span>
      <span className={`${s.text} font-bold text-senegal-yellow`}>G</span>
      <span className={`${s.text} font-bold text-senegal-red`}>a</span>
      <span className={`${s.text} font-bold text-senegal-red`}>m</span>
    </div>
  )
}
