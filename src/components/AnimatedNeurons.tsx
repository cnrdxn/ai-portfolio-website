import { useEffect, useRef } from 'react'
import { capabilities } from '../capabilities'

type AnimatedNeuronsProps = {
  center: number;
  radius: number;
  glowId: string;
  activeIndex: number | null;
  onActivate: (index: number, element: SVGElement) => void;
}

type Quaternion = [number, number, number, number]
type Vector3 = [number, number, number]

const neuronCount = 360
const goldenAngle = Math.PI * (3 - Math.sqrt(5))
const baseNeurons = Array.from({ length: neuronCount }, (_, index) => {
  const y = 1 - 2 * (index + 0.5) / neuronCount
  const ringRadius = Math.sqrt(1 - y * y)
  const angle = index * goldenAngle
  return {
    index,
    x: Math.cos(angle) * ringRadius,
    y,
    z: Math.sin(angle) * ringRadius,
  }
})

const capabilityNeurons = Array.from({ length: capabilities.length }, (_, index) => {
  const y = 1 - 2 * (index + 0.5) / capabilities.length
  const ringRadius = Math.sqrt(1 - y * y)
  const angle = index * Math.PI * (3 - Math.sqrt(5)) + 0.31
  const x = Math.cos(angle) * ringRadius
  const z = Math.sin(angle) * ringRadius

  // Start the capability landmarks from a slightly tilted sphere so their
  // projected positions are distinct before the first animation frame.
  const tilt = 0.19
  return {
    x: x * Math.cos(tilt) - y * Math.sin(tilt),
    y: x * Math.sin(tilt) + y * Math.cos(tilt),
    z,
  }
})

function normalizeQuaternion(q: Quaternion): Quaternion {
  const length = Math.hypot(q[0], q[1], q[2], q[3]) || 1
  return [q[0] / length, q[1] / length, q[2] / length, q[3] / length]
}

function multiplyQuaternion(a: Quaternion, b: Quaternion): Quaternion {
  return normalizeQuaternion([
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ])
}

function rotateVector(q: Quaternion, vector: Vector3): Vector3 {
  const [w, x, y, z] = q
  const [vx, vy, vz] = vector
  const tx = 2 * (y * vz - z * vy)
  const ty = 2 * (z * vx - x * vz)
  const tz = 2 * (x * vy - y * vx)
  return [
    vx + w * tx + (y * tz - z * ty),
    vy + w * ty + (z * tx - x * tz),
    vz + w * tz + (x * ty - y * tx),
  ]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function rotationBetween(from: Vector3, to: Vector3): Quaternion {
  const dot = clamp(from[0] * to[0] + from[1] * to[1] + from[2] * to[2], -1, 1)
  if (dot < -0.999999) {
    const axis: Vector3 = Math.abs(from[0]) < 0.8 ? [0, from[2], -from[1]] : [-from[2], 0, from[0]]
    return normalizeQuaternion([0, ...axis])
  }
  return normalizeQuaternion([1 + dot,
    from[1] * to[2] - from[2] * to[1],
    from[2] * to[0] - from[0] * to[2],
    from[0] * to[1] - from[1] * to[0],
  ])
}

export function AnimatedNeurons({ center, radius, glowId, activeIndex, onActivate }: AnimatedNeuronsProps) {
  const groupRef = useRef<SVGGElement>(null)
  const gestureRef = useRef({ active: false, suppressClickUntil: 0 })
  useEffect(() => {
    const group = groupRef.current
    const svg = group?.ownerSVGElement
    if (!group || !svg) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let orientation: Quaternion = [1, 0, 0, 0]
    let reducedMotion = motionQuery.matches
    let isVisible = typeof IntersectionObserver === 'undefined'
    let isDocumentVisible = document.visibilityState !== 'hidden'
    let frameId = 0
    let lastFrame = 0
    let pointerId: number | null = null
    let previousPoint: Vector3 = [0, 0, 1]
    let startClient = { x: 0, y: 0 }
    let hasDragged = false

    const pointerOnSphere = (event: PointerEvent): Vector3 => {
      const matrix = svg.getScreenCTM()
      if (!matrix) return [0, 0, 1]
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
      let x = (point.x - center) / radius
      let y = (point.y - center) / radius
      const distance = Math.hypot(x, y)
      if (distance > 1) { x /= distance; y /= distance }
      return [x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y))]
    }

    const particleElements = Array.from(group.querySelectorAll<SVGCircleElement>('[data-neuron]'))
      .map(element => ({ element, index: Number(element.dataset.neuron) }))
    const capabilityElements = Array.from(group.querySelectorAll<SVGGElement>('[data-capability-neuron]'))
      .map(element => ({ element, index: Number(element.dataset.capabilityNeuron) }))
    const connectorElements = capabilities.map((_, index) =>
      svg.querySelector<SVGPathElement>(`[data-capability-connector="${index}"]`),
    )

    const updateMode = () => {
      const mode = gestureRef.current.active ? 'dragging' : reducedMotion ? 'reduced-motion' : 'idle'
      group.setAttribute('data-orb-mode', mode)
    }

    const render = () => {
      particleElements.forEach(({ element, index }) => {
        const neuron = baseNeurons[index]
        const [x, y, depth] = rotateVector(orientation, [neuron.x, neuron.y, neuron.z])
        const screenFrontness = clamp((depth + 1) / 2, 0, 1)
        const opacity = 0.11 + 0.3 * screenFrontness
        const particleRadius = 0.72 + screenFrontness * 0.28

        element.setAttribute('cx', String(center + x * radius))
        element.setAttribute('cy', String(center + y * radius))
        element.setAttribute('r', String(particleRadius))
        element.setAttribute('opacity', String(opacity))
        element.setAttribute('fill', '#57e5e7')
      })

      capabilityElements.forEach(({ element, index }) => {
        const neuron = capabilityNeurons[index]
        const [x, y, depth] = rotateVector(orientation, [neuron.x, neuron.y, neuron.z])
        const screenFrontness = clamp((depth + 1) / 2, 0, 1)
        const scale = 0.94 + screenFrontness * 0.12
        const opacity = 0.55 + screenFrontness * 0.45

        element.setAttribute('transform', `translate(${center + x * radius} ${center + y * radius}) scale(${scale})`)
        element.setAttribute('opacity', String(opacity))

        const connector = connectorElements[index]
        if (connector) {
          // Give each connection its own orbital lane, avoiding chords
          // across the sphere while preserving its moving neuron endpoint.
          const sourceAngle = (-90 + index * 36) * Math.PI / 180
          const targetAngle = Math.atan2(y, x)
          const angleDelta = Math.atan2(Math.sin(targetAngle - sourceAngle), Math.cos(targetAngle - sourceAngle))
          const laneRadius = radius + 27 + index * 2.3
          const startX = center + Math.cos(sourceAngle) * laneRadius
          const startY = center + Math.sin(sourceAngle) * laneRadius
          const endX = center + Math.cos(targetAngle) * laneRadius
          const endY = center + Math.sin(targetAngle) * laneRadius
          const neuronX = center + x * radius
          const neuronY = center + y * radius
          const controlX = endX - Math.cos(targetAngle) * 24
          const controlY = endY - Math.sin(targetAngle) * 24
          const approachX = neuronX + Math.cos(targetAngle) * 16 - Math.sin(targetAngle) * 7
          const approachY = neuronY + Math.sin(targetAngle) * 16 + Math.cos(targetAngle) * 7
          connector.setAttribute('d', `M${connector.dataset.labelX} ${connector.dataset.labelY} L${startX} ${startY} A${laneRadius} ${laneRadius} 0 0 ${angleDelta >= 0 ? 1 : 0} ${endX} ${endY} C${controlX} ${controlY} ${approachX} ${approachY} ${neuronX} ${neuronY}`)
        }
      })
    }

    const stopLoop = () => {
      if (frameId) cancelAnimationFrame(frameId)
      frameId = 0
      lastFrame = 0
    }

    const syncLoop = () => {
      updateMode()
      if (isVisible && isDocumentVisible && !reducedMotion && !gestureRef.current.active) {
        if (!frameId) frameId = requestAnimationFrame(tick)
      } else {
        stopLoop()
      }
    }

    const tick = (now: number) => {
      frameId = 0
      if (!isVisible || !isDocumentVisible || reducedMotion || gestureRef.current.active) return

      if (lastFrame) {
        const deltaTime = Math.min((now - lastFrame) / 1000, 0.05)
        const speed = 0.12
        const axis: Vector3 = [0.36, 0.82, 0.44]
        const halfAngle = speed * deltaTime / 2
        const delta: Quaternion = [
          Math.cos(halfAngle),
          axis[0] * Math.sin(halfAngle),
          axis[1] * Math.sin(halfAngle),
          axis[2] * Math.sin(halfAngle),
        ]
        orientation = multiplyQuaternion(delta, orientation)
        render()
      }

      lastFrame = now
      frameId = requestAnimationFrame(tick)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || pointerId !== null) return
      pointerId = event.pointerId
      startClient = { x: event.clientX, y: event.clientY }
      previousPoint = pointerOnSphere(event)
      hasDragged = false
      gestureRef.current.active = true
      group.setPointerCapture(event.pointerId)
      syncLoop()
    }
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      if (!hasDragged && Math.hypot(event.clientX - startClient.x, event.clientY - startClient.y) < 3) return
      hasDragged = true
      event.preventDefault()
      const nextPoint = pointerOnSphere(event)
      orientation = multiplyQuaternion(rotationBetween(previousPoint, nextPoint), orientation)
      previousPoint = nextPoint
      render()
    }
    const endDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      pointerId = null
      gestureRef.current.active = false
      if (hasDragged) gestureRef.current.suppressClickUntil = performance.now() + 250
      if (group.hasPointerCapture(event.pointerId)) group.releasePointerCapture(event.pointerId)
      syncLoop()
    }

    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches
      updateMode()
      syncLoop()
    }

    const onVisibilityChange = () => {
      isDocumentVisible = document.visibilityState !== 'hidden'
      syncLoop()
    }

    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(entries => {
        isVisible = entries.some(entry => entry.isIntersecting)
        syncLoop()
      }, { threshold: 0.01 })

    motionQuery.addEventListener('change', onMotionPreferenceChange)
    group.addEventListener('pointerdown', onPointerDown)
    group.addEventListener('pointermove', onPointerMove)
    group.addEventListener('pointerup', endDrag)
    group.addEventListener('pointercancel', endDrag)
    group.addEventListener('lostpointercapture', endDrag)
    document.addEventListener('visibilitychange', onVisibilityChange)
    if (observer) observer.observe(svg)

    updateMode()
    render()
    syncLoop()

    return () => {
      stopLoop()
      gestureRef.current.active = false
      if (pointerId !== null && group.hasPointerCapture(pointerId)) group.releasePointerCapture(pointerId)
      group.removeEventListener('pointerdown', onPointerDown)
      group.removeEventListener('pointermove', onPointerMove)
      group.removeEventListener('pointerup', endDrag)
      group.removeEventListener('pointercancel', endDrag)
      group.removeEventListener('lostpointercapture', endDrag)
      observer?.disconnect()
      motionQuery.removeEventListener('change', onMotionPreferenceChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [center, radius, glowId])

  return <g ref={groupRef} data-orb-mode="idle">
    {baseNeurons.map(neuron => <circle
      key={neuron.index}
      data-neuron={neuron.index}
      cx={center + neuron.x * radius}
      cy={center + neuron.y * radius}
      r="1"
      fill="#57e5e7"
      opacity=".2"
      pointerEvents="none"
    />)}
    <circle
      className="neural-hit-area"
      cx={center}
      cy={center}
      r={radius}
      fill="transparent"
      pointerEvents="all"
      aria-hidden="true"
    />
    {capabilities.map((capability, index) => {
      const neuron = capabilityNeurons[index]
      const isActive = activeIndex === index
      return <g
        key={capability.id}
        className={`neuron-trigger${isActive ? ' is-active' : ''}`}
        data-capability-neuron={index}
        transform={`translate(${center + neuron.x * radius} ${center + neuron.y * radius})`}
        role="button"
        tabIndex={0}
        aria-label={`Explore ${capability.title} neuron`}
        aria-expanded={isActive}
        onPointerEnter={event => { if (!gestureRef.current.active) onActivate(index, event.currentTarget) }}
        onFocus={event => onActivate(index, event.currentTarget)}
        onClick={event => { if (performance.now() >= gestureRef.current.suppressClickUntil) onActivate(index, event.currentTarget) }}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onActivate(index, event.currentTarget)

          }
        }}
      >
        <circle r="11" fill="#57e5e7" opacity=".2" filter={`url(#${glowId})`} pointerEvents="none" />
        <circle r="8.2" fill="#062c33" stroke="#57e5e7" strokeWidth="1" opacity=".92" pointerEvents="none" />
        <circle r="6.4" fill="none" stroke="#b8ffff" strokeWidth=".7" opacity=".76" pointerEvents="none" />
        <circle data-neuron-core="true" r="3.4" fill="#d7ffff" stroke="#57e5e7" strokeWidth=".9" pointerEvents="none" />
        <circle className="neural-hit-area" r="13" fill="transparent" pointerEvents="all" />
      </g>
    })}
  </g>
}
