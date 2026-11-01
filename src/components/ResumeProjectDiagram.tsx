import { useId } from 'react'

export function ResumeProjectDiagram({ kind }: { kind: string }) {
  const id = useId().replaceAll(':', '')
  const resolver = kind === 'iterative-topic-resolver'
  const fraud = kind === 'wifi-fraud-detection'
  const accent = resolver ? '#d7c49b' : fraud ? '#9eafb2' : '#57e5e7'
  const figure = resolver ? 'FIG.02' : fraud ? 'FIG.03' : 'FIG.01'
  const heading = resolver ? 'ITERATIVE TOPIC RESOLVER' : fraud ? 'WIFI FRAUD DETECTION' : 'ENTERPRISE AI ANSWERS'
  const description = resolver
    ? 'Iterative Topic Resolver categorizing technician notes with a rubric, human review for ambiguous cases, and resumable Azure OpenAI batch jobs.'
    : fraud
      ? 'WiFi Sharing Fraud Detection moving subject activity through production model pipelines to flagged accounts and measured revenue recovery.'
      : 'Enterprise AI answers platform routing employee questions through contextual rewriting, vector retrieval, grounded answers, and release evaluation.'

  return (
    <svg
      className="project-diagram resume-project-diagram"
      viewBox="0 0 600 340"
      role="img"
      aria-labelledby={`${id}-title`}
      style={{ color: accent }}
    >
      <title id={`${id}-title`}>{description}</title>
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
      <g fill="none" stroke="currentColor" opacity=".12">
        <circle cx="300" cy="173" r="113" />
        <circle cx="300" cy="173" r="141" strokeDasharray="2 7" />
      </g>

      <g fill="currentColor" fontFamily="monospace" fontSize="8" letterSpacing="1" opacity=".48">
        <text x="20" y="24">CD / PROJECT ARCHITECTURE</text>
        <text x="580" y="24" textAnchor="end">{heading}</text>
      </g>

      {resolver ? <>
        {/* Categorical scoring rubric guides each Azure OpenAI batch run. */}
        <path d={`M300 96V130`} fill="none" stroke="currentColor" strokeWidth="1.1" markerEnd={`url(#${id}-arrow)`} />
        <path d={`M156 171H234`} fill="none" stroke="currentColor" strokeWidth="1.2" markerEnd={`url(#${id}-arrow)`} />
        <path d={`M366 163H444`} fill="none" stroke="currentColor" strokeWidth="1.2" markerEnd={`url(#${id}-arrow)`} />

        {/* Checkpoint state preserves completed work and reconnects to the in-flight batch. */}
        <path d={`M300 214V258`} fill="none" stroke="currentColor" strokeWidth="1.1" markerEnd={`url(#${id}-arrow)`} />
        <path d={`M176 282H156V229H220V178H234`} fill="none" stroke="currentColor" strokeWidth="1.1" strokeDasharray="4 4" markerEnd={`url(#${id}-arrow)`} />
        {/* Only ambiguous classifications branch to human review. */}
        <path d={`M510 205V241H483V258`} fill="none" stroke="currentColor" strokeWidth="1.1" strokeDasharray="3 3" markerEnd={`url(#${id}-arrow)`} />

        <g fill="currentColor" fillOpacity=".035" stroke="currentColor" strokeWidth="1.1">
          <rect x="220" y="49" width="160" height="47" rx="2" />
          <rect x="24" y="140" width="132" height="64" rx="2" />
          <rect x="234" y="130" width="132" height="84" rx="2" />
          <rect x="444" y="140" width="132" height="64" rx="2" />
          <rect x="176" y="258" width="206" height="49" rx="2" />
          <rect x="400" y="258" width="166" height="49" rx="2" />
        </g>


        <g fill="currentColor" fontFamily="monospace" textAnchor="middle">
          <text x="300" y="68" fontSize="9" letterSpacing=".65">CATEGORICAL RUBRIC</text>
          <text x="300" y="82" fontSize="7" letterSpacing=".2" opacity=".65">DECISIVE-FIRST RANKING</text>
          <text x="90" y="165" fontSize="9" letterSpacing=".55">TECHNICIAN NOTES</text>
          <text x="90" y="182" fontSize="7" letterSpacing=".25" opacity=".65">FREE-TEXT ISSUES</text>
          <text x="300" y="159" fontSize="8.5" letterSpacing=".4">AZURE OPENAI</text>
          <text x="300" y="174" fontSize="6.5" letterSpacing=".15" opacity=".68">BATCH · ~316K</text>
          <text x="300" y="186" fontSize="6.5" letterSpacing=".15" opacity=".68">CLASSIFICATIONS</text>
          <text x="510" y="165" fontSize="8.5" letterSpacing=".35">ISSUE CATEGORIES</text>
          <text x="510" y="182" fontSize="7" letterSpacing=".2" opacity=".65">CATEGORICAL SCORES</text>
          <text x="279" y="278" fontSize="8.5" letterSpacing=".55">CHECKPOINT STATE</text>
          <text x="279" y="294" fontSize="6.5" letterSpacing=".15" opacity=".7">RESUME IN-FLIGHT · NO RESUBMIT</text>
          <text x="483" y="278" fontSize="8.5" letterSpacing=".55">HUMAN REVIEW</text>
          <text x="483" y="294" fontSize="7" letterSpacing=".2" opacity=".68">~10% OF TOPICS REFINED</text>
          <text x="516" y="235" fontSize="6.5" letterSpacing=".45" opacity=".65">AMBIGUOUS</text>
        </g>
      </> : fraud ? <>
        {/* Production pipeline rail and the documented Version 2 coverage increase. */}
        <path d={`M90 145V113H510V145`} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" markerEnd={`url(#${id}-arrow)`} opacity=".8" />
        <rect x="190" y="49" width="220" height="48" rx="2" fill="currentColor" fillOpacity=".035" stroke="currentColor" strokeWidth="1" />
        <g fill="currentColor" fontFamily="monospace" textAnchor="middle">
          <text x="300" y="68" fontSize="9" letterSpacing=".55">10+ PRODUCTION PIPELINES</text>
          <text x="300" y="83" fontSize="6.8" letterSpacing=".15" opacity=".68">VERSION 2 · SUBJECTS ANALYZED +106%</text>
        </g>

        <path d={`M156 176H234`} fill="none" stroke="currentColor" strokeWidth="1.2" markerEnd={`url(#${id}-arrow)`} />
        <path d={`M366 176H444`} fill="none" stroke="currentColor" strokeWidth="1.2" markerEnd={`url(#${id}-arrow)`} />
        <path d={`M510 208V237H300V258`} fill="none" stroke="currentColor" strokeWidth="1.1" strokeDasharray="3 4" markerEnd={`url(#${id}-arrow)`} />

        <g fill="currentColor" fillOpacity=".035" stroke="currentColor" strokeWidth="1.1">
          <rect x="24" y="145" width="132" height="63" rx="2" />
          <rect x="234" y="132" width="132" height="88" rx="2" />
          <rect x="444" y="145" width="132" height="63" rx="2" />
          <rect x="158" y="258" width="284" height="49" rx="2" />
        </g>


        <g fill="currentColor" fontFamily="monospace" textAnchor="middle">
          <text x="90" y="168" fontSize="8.5" letterSpacing=".45">WIFI SHARING DATA</text>
          <text x="90" y="185" fontSize="7" letterSpacing=".2" opacity=".65">SUBJECT ACTIVITY</text>
          <text x="300" y="161" fontSize="8.5" letterSpacing=".35">FRAUD DETECTION</text>
          <text x="300" y="178" fontSize="7" letterSpacing=".2" opacity=".68">VERSION 1 / 2</text>
          <text x="300" y="191" fontSize="6.5" letterSpacing=".15" opacity=".63">MODEL PIPELINE</text>
          <text x="510" y="168" fontSize="8.2" letterSpacing=".25">FLAGGED ACCOUNTS</text>
          <text x="510" y="185" fontSize="7" letterSpacing=".15" opacity=".65">REVENUE LEAKAGE</text>
          <text x="300" y="278" fontSize="8.5" letterSpacing=".5">VERSION 1 · ~100 ACCOUNTS IDENTIFIED</text>
          <text x="300" y="294" fontSize="7" letterSpacing=".25" opacity=".68">$350K+ ANNUAL REVENUE RECOVERY</text>
        </g>
      </> : <>
        {/* Context feeds follow-up routing; the four-stage retrieval path stays explicit. */}
        <path d={`M224 98V142`} fill="none" stroke="currentColor" strokeWidth="1.05" strokeDasharray="3 3" markerEnd={`url(#${id}-arrow)`} />
        <path d="M224 98V119H509V141" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity=".55" markerEnd={`url(#${id}-arrow)`} />
        <path d={`M134 172H164M278 172H308M422 172H452`} fill="none" stroke="currentColor" strokeWidth="1.2" markerEnd={`url(#${id}-arrow)`} />
        {/* The 100-case judge benchmark is a release gate, not a runtime answer stage. */}
        <path d={`M509 205V231H300V249`} fill="none" stroke="currentColor" strokeWidth="1.05" strokeDasharray="3 4" markerEnd={`url(#${id}-arrow)`} />

        <g fill="currentColor" fillOpacity=".035" stroke="currentColor" strokeWidth="1.1">
          <rect x="158" y="50" width="132" height="48" rx="2" />
          <rect x="20" y="141" width="114" height="64" rx="2" />
          <rect x="164" y="141" width="114" height="64" rx="2" />
          <rect x="308" y="141" width="114" height="64" rx="2" />
          <rect x="452" y="141" width="114" height="64" rx="2" />
          <rect x="175" y="249" width="250" height="51" rx="2" />
        </g>


        <g fill="currentColor" fontFamily="monospace" textAnchor="middle">
          <text x="224" y="69" fontSize="8.2" letterSpacing=".3">CONTEXT FEED</text>
          <text x="224" y="84" fontSize="7" letterSpacing=".2" opacity=".65">BOUNDED HISTORY</text>
          <text x="77" y="168" fontSize="9" letterSpacing=".65">QUESTION</text>
          <text x="77" y="184" fontSize="7" letterSpacing=".25" opacity=".65">EMPLOYEE ASK</text>
          <text x="221" y="168" fontSize="8.4" letterSpacing=".35">INTENT ROUTE</text>
          <text x="221" y="184" fontSize="6.8" letterSpacing=".1" opacity=".65">FOLLOW-UP REWRITE</text>
          <text x="365" y="168" fontSize="8.2" letterSpacing=".15">VECTOR RETRIEVAL</text>
          <text x="365" y="184" fontSize="7" letterSpacing=".2" opacity=".65">SOURCE DOCUMENTS</text>
          <text x="509" y="168" fontSize="8" letterSpacing=".15">GROUNDED ANSWER</text>
          <text x="509" y="184" fontSize="7" letterSpacing=".2" opacity=".65">ANSWER / DECLINE</text>
          <text x="300" y="270" fontSize="8.5" letterSpacing=".55">LLM-AS-JUDGE · 100 CASES</text>
          <text x="300" y="286" fontSize="6.4" letterSpacing=".1" opacity=".68">RELEASE GATE · &gt;90% QUALITY · 98% ANSWER / DECLINE</text>
        </g>
      </>}

      <g fill="currentColor" fontFamily="monospace" fontSize="8" letterSpacing="1" opacity=".5">
        <text x="20" y="323">ILLUSTRATIVE ARCHITECTURE</text>
        <text x="580" y="323" textAnchor="end">{figure}</text>
      </g>
    </svg>
  )
}
