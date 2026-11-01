import { useEffect, useRef, useState } from 'react'
import { experience, profile, projects, type Project } from './content'
import { SystemDiagram, ProjectDiagram } from './components/Diagrams'

const navigation = [['overview', 'Overview'], ['work', 'Work'], ['experience', 'Experience'], ['about', 'About'], ['contact', 'Contact']] as const
function Arrow({ diagonal = false }: { diagonal?: boolean }) { return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span> }

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const panel = useRef<HTMLElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const elements = panel.current?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]')
      if (!elements?.length) return
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      previousFocus?.focus()
    }
  }, [onClose])
  return <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={panel} className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-title">
      <button ref={closeButton} className="modal-close" onClick={onClose} aria-label="Close project details">×</button>
      <p className="modal-eyebrow">{project.number} / {project.category}</p>
      <h2 id="project-title">{project.title}</h2><p className="project-role">{project.role}</p><p className="modal-summary">{project.summary}</p>
      {!!project.metrics?.length && <dl className="project-metrics project-metrics--modal">{project.metrics.map(metric => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl>}
      <div className={`modal-art project-card--${project.theme}`}><ProjectDiagram kind={project.id} /></div>
      <div className="tag-list">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <div className="modal-sections">{[['The challenge', project.challenge], ['System architecture', project.architecture], ['Evaluation & outcomes', project.validation], [project.detailHeading ?? 'What’s next', project.nextSteps]].map(([title, text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}</div>
      <p className="placeholder-note">Architecture illustrations summarize the system design.</p>
    </section>
  </div>
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('top')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showTop, setShowTop] = useState(false)
  const closeProject = useRef(() => setSelectedProject(null)).current
  useEffect(() => {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target) } })
    }, { threshold: 0.08 })
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element))
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id) })
    }, { rootMargin: '-15% 0px -55% 0px' })
    document.querySelectorAll('main > section[id]').forEach(element => sectionObserver.observe(element))
    const onScroll = () => setShowTop(window.scrollY > 650)
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll()
    return () => { revealObserver.disconnect(); sectionObserver.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#top" onClick={() => setMenuOpen(false)} aria-label="Connor Dixon home"><span className="brand-mark" aria-hidden="true" /><span>CONNOR DIXON</span></a>
      <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined}>{label}</a>)}</nav>
      <a className="header-cta" href="#contact">Let’s talk <Arrow diagonal /></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close −' : 'Menu +'}</button>
    </header>
    {menuOpen && <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">{navigation.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}<Arrow /></a>)}</nav>}
    <main id="main">
      <section className="hero" id="top">
        <div className="hero-grid"><div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" />CONNOR DIXON / AI SYSTEMS ENGINEER</p>
          <h1 className="hero-title"><span className="hero-first-line">BUILDING AI PRODUCTS.</span><br /><span className="outline-text">IDEA TO LAUNCH.</span></h1>
          <p className="hero-description">I’m Connor. I build AI-powered products that solve complex problems, taking them from the initial ask to a finished product as the sole engineer.</p>
          <div className="hero-actions"><a className="button button-primary" href="#work">Explore the work <Arrow /></a><a className="text-link" href="#about">A little about me <Arrow diagonal /></a></div>
          <div id="capability-details" className="capability-panel-slot" />
        </div><div className="hero-visual"><SystemDiagram /></div></div>
        <div className="hero-bottom"><span className="location">BASED IN DENVER, COLORADO ↗</span><a className="hero-index" href="#overview">SCROLL TO EXPLORE ↓</a></div>
      </section>
      <section className="section-shell value-section" id="overview" aria-labelledby="overview-title">
        <div className="section-heading section-heading--stacked reveal"><div><p className="section-kicker">01 / BUILT AROUND THE PROBLEM</p><h2 id="overview-title">I build products<br />that solve problems.</h2><p className="section-description">I take ownership of the full product, including the interface, application, and infrastructure needed to ship it.</p></div></div>
          <div className="hero-highlights">
            <article className="hero-highlight reveal"><p className="hero-highlight-label">ENTERPRISE AI / SPECTRUM</p><h3>Knowledge, made usable.</h3><p>I architected and shipped an enterprise AI answers platform in 10 weeks, bringing company knowledge into grounded, conversational tools.</p><a className="text-link" href="#work">Explore the projects <Arrow diagonal /></a></article>
            <article className="hero-highlight reveal"><p className="hero-highlight-label">APPLIED MACHINE LEARNING</p><h3>Data that drives action.</h3><p>My fraud detection work helped identify revenue-leakage accounts and recover $350K+ annually.</p><a className="text-link" href="#experience">See my background <Arrow diagonal /></a></article>
            <article className="hero-highlight reveal"><p className="hero-highlight-label">TECHNICAL LEADERSHIP</p><h3>A team equipped to build.</h3><p>I lead technical work and support my team’s development through practical tools, shared knowledge, and day-to-day guidance.</p></article>
            <article className="hero-highlight reveal"><p className="hero-highlight-label">COMMUNICATION / LEADERSHIP</p><h3>Technical work, clearly explained.</h3><p>I help teams and leadership understand technical decisions, product capabilities, and what they mean for the business.</p></article>
          </div>
      </section>
      <section className="section-shell" id="work">
        <div className="section-heading reveal"><div><p className="section-kicker">02 / SELECTED WORK</p><h2>Intelligence,<br />put to work.</h2></div><p>A look inside the systems.<br />Explore the architecture, engineering decisions, and results.</p></div>
        <div className="project-grid">{projects.map(project => <button key={project.id} className={`project-card project-card--${project.theme} reveal`} onClick={() => setSelectedProject(project)} aria-label={`Open ${project.title} project details`}>
          <div className="project-art"><ProjectDiagram kind={project.id} /><span className="placeholder-label">{project.badge ?? 'PROJECT OVERVIEW'}</span></div>
          <div className="project-content"><div className="project-meta"><span>{project.number} / {project.category}</span><span>{project.role}</span></div><h3>{project.title}</h3><p>{project.summary}</p>{!!project.metrics?.length && <dl className="project-metrics">{project.metrics.map(metric => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl>}<div className="project-bottom"><div className="tag-list">{project.tags.slice(0, 3).map(tag => <span key={tag}>{tag}</span>)}</div><span className="arrow-link" aria-hidden="true">↗</span></div></div>
        </button>)}</div>
      </section>
      <section className="section-shell experience-section" id="experience"><div className="section-heading reveal"><div><p className="section-kicker">03 / THE PATH SO FAR</p><h2>A foundation<br />in doing.</h2></div><p>From data science to AI systems.<br />A brief timeline, with more context to come.</p></div><div className="experience-list">{experience.map(item => <article className="experience-row reveal" key={item.period + item.role}><span className="experience-date">{item.period}</span><div><h3>{item.role}</h3><span className="experience-organization">{item.organization}</span><p>{item.description}</p><div className="tag-list">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><span className="experience-arrow" aria-hidden="true">↗</span></article>)}</div></section>
      <section className="section-shell about-section" id="about"><div className="about-grid"><div className="about-copy reveal"><p className="section-kicker">04 / BEHIND THE SYSTEMS</p><h2>Hi, I’m Connor.</h2>{profile.about.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">More on LinkedIn <Arrow diagonal /></a></div><div className="about-facts reveal"><div><span className="fact-label">THE FOCUS</span><strong>Applied AI.<br />Built end to end.</strong><p>AI products designed around a specific problem and the people facing it.</p></div><div><span className="fact-label">THE FOUNDATION</span><strong>Computer science.<br />Production data science.</strong><p>University of Colorado Boulder · Cum laude<br />B.A. Computer Science · 2023<br />AWS Certified Cloud Practitioner</p></div><div><span className="fact-label">THE LOCATION</span><strong>Denver, Colorado.</strong><p>Based in Mountain time.</p></div></div></div></section>
      <section className="section-shell contact-section" id="contact"><div className="contact-panel reveal"><p className="eyebrow">05 / WHAT’S NEXT</p><h2>Let’s build<br /><em>something useful.</em></h2><p className="contact-description">Working on a hard AI problem?<br />I’d like to hear what you’re building.</p><div className="contact-actions"><a className="button button-primary" href={`mailto:${profile.email}`}>Say hello <Arrow diagonal /></a><a className="text-link" href={profile.linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn <Arrow diagonal /></a></div><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}</a></div></section>
    </main>
    <footer className="site-footer"><a className="wordmark" href="#top">CONNOR DIXON<span className="footer-dot" aria-hidden="true">◆</span></a><p>© {new Date().getFullYear()} Connor Dixon</p><a href="#top">BACK TO TOP ↑</a></footer>
    {showTop && <a className="back-to-top" href="#top" aria-label="Back to top">↑</a>}
    {selectedProject && <ProjectModal project={selectedProject} onClose={closeProject} />}
  </>
}
