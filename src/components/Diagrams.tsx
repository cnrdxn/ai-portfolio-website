import { useCallback, useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { capabilities } from '../capabilities'
import { AnimatedNeurons } from './AnimatedNeurons'
import { HouseButlerDiagram } from './HouseButlerDiagram'
import { ResumeProjectDiagram } from './ResumeProjectDiagram'

export function SystemDiagram() {
  const id = useId().replaceAll(':', '')
  const center = 380
  const orbRadius = 142
  const labelRadius = 286
  const boxWidth = 150
  const boxHeight = 48
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [panelTarget, setPanelTarget] = useState<HTMLElement | null>(null)
  useEffect(() => { setPanelTarget(document.getElementById('capability-details')) }, [])
  const close = useCallback(() => setActiveIndex(null), [])
  const activate = useCallback((index: number, _element: SVGElement) => setActiveIndex(index), [])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])
  const labels = capabilities.map(({ lines }, index) => {
    const angle = (-90 + index * 36) * Math.PI / 180
    const unitX = Math.cos(angle)
    const unitY = Math.sin(angle)
    const edgeOffset = Math.min(
      Math.abs(unitX) < 0.0001 ? Infinity : boxWidth / 2 / Math.abs(unitX),
      Math.abs(unitY) < 0.0001 ? Infinity : boxHeight / 2 / Math.abs(unitY),
    )
    const boxCenterX = center + unitX * labelRadius
    const boxCenterY = center + unitY * labelRadius

    return {
      lines,
      boxCenterX,
      boxCenterY,
      boxX: boxCenterX - boxWidth / 2,
      boxY: boxCenterY - boxHeight / 2,
      connectorStartX: center + unitX * orbRadius,
      connectorStartY: center + unitY * orbRadius,
      connectorEndX: center + unitX * (labelRadius - edgeOffset),
      connectorEndY: center + unitY * (labelRadius - edgeOffset),
    }
  })
  const ticks = Array.from({ length: 36 }, (_, index) => {
    const angle = (-90 + index * 10) * Math.PI / 180
    const major = index % 6 === 0
    const innerRadius = 202
    const outerRadius = major ? 212 : 207
    return {
      x1: center + Math.cos(angle) * innerRadius,
      y1: center + Math.sin(angle) * innerRadius,
      x2: center + Math.cos(angle) * outerRadius,
      y2: center + Math.sin(angle) * outerRadius,
      major,
    }
  })
  const active = activeIndex === null ? null : capabilities[activeIndex]
  const detailPanel = active ? <aside
    id={`${id}-detail`} className="capability-popover capability-popover--docked"
    aria-label={`${active.title} experience`}
  >
    <div className="capability-popover-top"><span className="capability-popover-index">CAPABILITY / {String(activeIndex! + 1).padStart(2, '0')}</span><button className="capability-popover-close" aria-label="Close capability details" onClick={close}>×</button></div>
    <h3>{active.title}</h3><p>{active.description}</p>
    <div className="capability-pills">{active.skills.map(skill => <span key={skill}>{skill}</span>)}</div>
    <div className="capability-popover-bottom">EXPERIENCE / CONNOR DIXON</div>
  </aside> : <aside className="capability-popover capability-popover--docked capability-popover--prompt" aria-label="Explore the orb">
    <div className="capability-popover-top"><span className="capability-popover-index">INTERACTIVE CAPABILITY MAP</span><span className="orb-prompt-symbol" aria-hidden="true">◎</span></div>
    <h3>Explore how I build.</h3>
    <p>Drag the orb to rotate it. Hover over a capability to see my experience.</p>
    <div className="capability-popover-bottom">TAP A CAPABILITY ON TOUCH SCREENS</div>
  </aside>
  return <div className="neural-system"><svg className="system-diagram" viewBox="0 0 760 760" role="group" aria-label="Explore Connor’s experience using the rotating capability neurons or their labels">
    <defs>
      <radialGradient id={`${id}-halo`}>
        <stop offset="0%" stopColor="#57e5e7" stopOpacity=".14" />
        <stop offset="58%" stopColor="#57e5e7" stopOpacity=".055" />
        <stop offset="100%" stopColor="#57e5e7" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${id}-orb-fill`} cx="46%" cy="40%" r="72%">
        <stop offset="0%" stopColor="#57e5e7" stopOpacity=".075" />
        <stop offset="72%" stopColor="#57e5e7" stopOpacity=".025" />
        <stop offset="100%" stopColor="#122528" stopOpacity=".58" />
      </radialGradient>
      <filter id={`${id}-node-glow`} x="-300%" y="-300%" width="700%" height="700%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="2.4" result="softGlow" />
        <feMerge><feMergeNode in="softGlow" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>

    <circle className="neural-orb-halo" cx={center} cy={center} r="278" fill={`url(#${id}-halo)`} />

    <g fill="none" stroke="#57e5e7" strokeWidth=".8">
      <circle cx={center} cy={center} r="166" strokeOpacity=".18" />
      <circle cx={center} cy={center} r="202" strokeOpacity=".095" />
    </g>
    <g stroke="#57e5e7" strokeWidth=".8" strokeOpacity=".32">
      {ticks.map((tick, index) => <line key={index} x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} opacity={tick.major ? '.9' : '.52'} />)}
    </g>

    <g fill="none" stroke="#57e5e7" strokeWidth=".8" pointerEvents="none">
      {labels.map((label, index) => <path key={index} data-capability-connector={index} data-label-x={label.connectorEndX} data-label-y={label.connectorEndY} className={`capability-connector ${activeIndex === index ? 'is-active' : ''}`} d={`M${label.connectorEndX} ${label.connectorEndY}L${label.connectorStartX} ${label.connectorStartY}`} />)}
    </g>

    <circle cx={center} cy={center} r={orbRadius} fill={`url(#${id}-orb-fill)`} />
    <AnimatedNeurons center={center} radius={orbRadius} glowId={`${id}-node-glow`} activeIndex={activeIndex} onActivate={activate} />
    <circle cx={center} cy={center} r={orbRadius} fill="none" stroke="#78f6f2" strokeOpacity=".27" strokeWidth=".9" pointerEvents="none" />

    {labels.map((label, index) => <g
      key={capabilities[index].id}
      className={`capability-trigger ${activeIndex === index ? 'is-active' : ''}`}
      data-capability-label={index}
      role="button" tabIndex={0}
      aria-label={`Explore ${capabilities[index].title}`}
      aria-expanded={activeIndex === index}
      aria-describedby={activeIndex === index ? `${id}-detail` : undefined}
      onPointerEnter={event => activate(index, event.currentTarget)}
      onFocus={event => activate(index, event.currentTarget)}
      onClick={event => activate(index, event.currentTarget)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(index, event.currentTarget) }
        if (event.key === 'Escape') close()
      }}
    >
      <rect x={label.boxX} y={label.boxY} width={boxWidth} height={boxHeight} rx="4" fill="#101a1d" stroke="#57e5e7" strokeOpacity=".52" strokeWidth=".9" />
      <text className="capability-label" x={label.boxCenterX} y={label.boxCenterY} fill="#c9dddd" fontSize="12" textAnchor="middle" pointerEvents="none">
        {label.lines.length === 1
          ? <tspan x={label.boxCenterX} y={label.boxCenterY + 4}>{label.lines[0]}</tspan>
          : label.lines.map((line, lineIndex) => <tspan key={line} x={label.boxCenterX} y={label.boxCenterY + (lineIndex === 0 ? -2 : 12)}>{line}</tspan>)}
      </text>
    </g>)}
  </svg>
  {detailPanel && panelTarget && createPortal(detailPanel, panelTarget)}
  </div>
}

export function ProjectDiagram({ kind }: { kind: string }) {
  return kind === 'house-butler' ? <HouseButlerDiagram /> : <ResumeProjectDiagram kind={kind} />
}
