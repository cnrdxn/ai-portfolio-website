import { useId } from 'react'

export function HouseButlerDiagram() {
  const id = useId().replaceAll(':', '')

  return (
    <svg
      className="project-diagram house-butler-diagram"
      viewBox="0 0 600 340"
      role="img"
      aria-labelledby={`${id}-title`}
      style={{ color: '#96cfb8' }}
    >
      <title id={`${id}-title`}>
        House Butler voice assistant connecting speech input, a tool-calling brain, home services, and spoken responses.
      </title>
      <defs>
        <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".1" />
        </pattern>
        <marker
          id={`${id}-arrow`}
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path d="M0 0L8 4L0 8Z" fill="currentColor" />
        </marker>
      </defs>

      <rect width="600" height="340" fill={`url(#${id}-grid)`} />
      <g fill="none" stroke="currentColor" opacity=".14">
        <circle cx="300" cy="168" r="111" />
        <circle cx="300" cy="168" r="137" strokeDasharray="2 7" />
      </g>

      <g fill="currentColor" fontFamily="monospace" fontSize="8" letterSpacing="1" opacity=".48">
        <text x="20" y="24">CD / HOUSE BUTLER</text>
        <text x="580" y="24" textAnchor="end">VOICE ASSISTANT / TOOL FLOW</text>
      </g>

      {/* Skill registry feeds the conversational core. */}
      <path d="M300 88V119" fill="none" stroke="currentColor" strokeWidth="1.2" markerEnd={`url(#${id}-arrow)`} />
      {/* Speech input enters the core, which calls services and receives their results. */}
      <path d="M168 166H224" fill="none" stroke="currentColor" strokeWidth="1.2" markerEnd={`url(#${id}-arrow)`} />
      <path d="M376 156H428" fill="none" stroke="currentColor" strokeWidth="1.2" markerEnd={`url(#${id}-arrow)`} />
      <path d="M428 181H401V198H376" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" markerEnd={`url(#${id}-arrow)`} />
      {/* Spoken response returns to the person at the voice interface. */}
      <path d="M300 217V250" fill="none" stroke="currentColor" strokeWidth="1.2" markerEnd={`url(#${id}-arrow)`} />
      <path d="M219 272H187V221H105V201" fill="none" stroke="currentColor" strokeWidth="1.1" strokeDasharray="4 4" markerEnd={`url(#${id}-arrow)`} />

      <g fill="currentColor" fontFamily="monospace" fontSize="7" letterSpacing=".8" opacity=".56">
        <text x="196" y="159" textAnchor="middle">WEBSOCKET</text>
        <text x="393" y="148" textAnchor="middle">FUNCTION CALL</text>
        <text x="402" y="194" textAnchor="middle">RESULT</text>
      </g>

      {/* Voice input */}
      <g fill="currentColor" fillOpacity=".035" stroke="currentColor" strokeWidth="1.1">
        <rect x="32" y="137" width="136" height="64" rx="2" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M51 161V177M57 156V182M63 163V175M69 159V179" />
      </g>
      <g fill="currentColor" fontFamily="monospace" textAnchor="middle">
        <text x="118" y="163" fontSize="9" letterSpacing=".8">VOICE INPUT</text>
        <text x="118" y="179" fontSize="7" letterSpacing=".35" opacity=".65">WAKE WORD · STT</text>
      </g>

      {/* Optional skill layer */}
      <g fill="currentColor" fillOpacity=".035" stroke="currentColor" strokeWidth="1.1">
        <rect x="225" y="43" width="150" height="45" rx="2" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="241" y="56" width="8" height="8" />
        <rect x="253" y="56" width="8" height="8" />
        <rect x="241" y="68" width="8" height="8" />
        <rect x="253" y="68" width="8" height="8" />
      </g>
      <text x="313" y="64" fill="currentColor" fontFamily="monospace" fontSize="9" letterSpacing=".7" textAnchor="middle">SKILL REGISTRY</text>
      <text x="313" y="77" fill="currentColor" fontFamily="monospace" fontSize="6.5" letterSpacing=".3" textAnchor="middle" opacity=".65">CALENDAR · WEATHER · NEWS</text>

      {/* Conversational brain and home icon */}
      <g fill="currentColor" fillOpacity=".055" stroke="currentColor" strokeWidth="1.2">
        <rect x="224" y="119" width="152" height="98" rx="2" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <path d="M239 156L258 141L277 156V184H239Z" />
        <path d="M247 161C247 157 252 155 255 157C257 153 264 153 266 158C271 158 272 164 269 166C272 170 269 176 264 176C261 180 254 178 253 175C248 176 245 170 248 167C245 165 245 162 247 161Z" />
        <path d="M258 158V176M251 164H258M258 169H266" strokeWidth=".8" opacity=".75" />
      </g>
      <g fill="currentColor" fontFamily="monospace" textAnchor="middle">
        <text x="327" y="163" fontSize="14" letterSpacing="1.2">BUTLER</text>
        <text x="327" y="179" fontSize="6.7" letterSpacing=".2" opacity=".66">LLM · FUNCTION CALLS</text>
      </g>
      <circle cx="224" cy="156" r="2.5" fill="currentColor" />
      <circle cx="376" cy="156" r="2.5" fill="currentColor" />
      <circle cx="376" cy="198" r="2.5" fill="currentColor" />

      {/* Home services and connected devices */}
      <g fill="currentColor" fillOpacity=".035" stroke="currentColor" strokeWidth="1.1">
        <rect x="428" y="137" width="140" height="64" rx="2" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M445 158L456 149L467 158V174H445Z" />
        <path d="M452 174V163H460V174M472 154H480V162H472ZM476 162V174H470" />
      </g>
      <g fill="currentColor" fontFamily="monospace" textAnchor="middle">
        <text x="521" y="163" fontSize="9" letterSpacing=".7">HOME + TOOLS</text>
        <text x="521" y="179" fontSize="7" letterSpacing=".2" opacity=".65">GOVEE · TUYA · APIs</text>
      </g>

      {/* Spoken response returns through ElevenLabs TTS. */}
      <g fill="currentColor" fillOpacity=".035" stroke="currentColor" strokeWidth="1.1">
        <rect x="219" y="250" width="162" height="44" rx="2" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M241 265H246L253 259V279L246 273H241Z" />
        <path d="M257 264C261 267 261 271 257 274M261 261C267 266 267 272 261 277" />
      </g>
      <text x="316" y="269" fill="currentColor" fontFamily="monospace" fontSize="8.5" letterSpacing=".6" textAnchor="middle">SPOKEN RESPONSE</text>
      <text x="316" y="282" fill="currentColor" fontFamily="monospace" fontSize="6.7" letterSpacing=".3" opacity=".65" textAnchor="middle">ELEVENLABS TTS</text>

      <g fill="currentColor" fontFamily="monospace" fontSize="8" letterSpacing="1" opacity=".55">
        <text x="20" y="322">FIG.04 / ILLUSTRATIVE ARCHITECTURE</text>
        <text x="580" y="322" textAnchor="end">VOICE · TOOLS · HOME</text>
      </g>
    </svg>
  )
}
