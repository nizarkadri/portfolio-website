import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AboutClient from './AboutClient'
import MyStory from '../../../components/MyStory'
import Skills from '../../../components/Skills'
import Education from '../../../components/about/Education'
import CertificateWall from '../../../components/about/CertificateWall'
import { CERTIFICATE_SLOTS, getCertificates } from '../../../components/about/certificates'
import { getSortedProjectsData } from '../../lib/projects'
import '../../about-experience.css'

export const metadata: Metadata = {
  title: 'About Me - Full Stack Developer Journey',
  description: 'Learn about my journey as a Full Stack Developer, my passion for technology, problem-solving approach, and the experiences that shaped my career in software engineering.',
  keywords: 'about me, full stack developer, software engineer, developer journey, programming experience, technology passion, problem solving',
  openGraph: {
    title: 'About Nizar Kadri - Full Stack Developer',
    description: 'Learn about my journey as a Full Stack Developer and passion for technology.',
    images: ['/images/about-og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Nizar Kadri - Full Stack Developer',
    description: 'Learn about my journey as a Full Stack Developer and passion for technology.',
    images: ['/images/about-og.jpg'],
  },
}

/** The same habits, on the board and in the codebase. */
const HABITS = [
  {
    san: 'Nf3',
    chess: 'Develop before you attack.',
    code: 'I learn the system before I change it: the data, the users, the constraints. A fast fix on a position you have not read tends to lose material.',
  },
  {
    san: 'Bc4',
    chess: 'Calculate the lines.',
    code: 'Two or three real candidates, played out to the end in my head or in a spike. Then one committed move, not five half ones.',
  },
  {
    san: 'O-O',
    chess: 'Every move has a cost.',
    code: 'A new dependency, a clever abstraction, a redesign: each one gives something up. I name the trade before I make it.',
  },
  {
    san: 'Re1',
    chess: 'Convert the advantage.',
    code: 'A winning position still has to be won. Accessibility, performance and the edge cases are where the work is actually finished.',
  },
]

export default async function AboutPage() {
  const certificates = getCertificates()
  const slots = Math.max(CERTIFICATE_SLOTS, certificates.length)
  const reserved = slots - certificates.length
  const projects = await getSortedProjectsData()

  return (
    <div className="ae">
      {/* The player, in daylight */}
      <div className="ae-band tone-day tone-ground lg-page">
        <section className="ae-hero lg-wrap" aria-labelledby="ae-about-title">
          <div className="ae-hero__copy">
            <p className="lg-note">[White <b>&quot;Kadri, Nizar&quot;</b>]</p>
            <h1 id="ae-about-title" className="lg-display lg-display--xl">The player behind<br className="ae-br" /> the board.</h1>
            <p className="lg-body lg-body--lg">
              I&rsquo;m Nizar Kadri, a full stack developer in Toronto. I have played chess since I was a child, and I
              build software the same way: the whole board first, then the move.
            </p>
            <div className="ae-hero__links">
              <Link href="#certificates" className="lg-link">The certificates</Link>
              <Link href="/experience" className="lg-link">Full experience</Link>
            </div>
          </div>
          <figure className="ae-hero__figure">
            <div className="ae-hero__frame">
              <Image
                src="/images/portraits/nizar-suit.webp"
                alt="Nizar Kadri in a black suit, white shirt and black tie, facing the camera in front of a marble wall"
                fill
                priority
                sizes="(max-width: 860px) 78vw, 30rem"
              />
            </div>
            <figcaption className="lg-note ae-pgn">
              <span>[Site &quot;Toronto, Canada&quot;]</span>
              <span>[Result &quot;*&quot;]</span>
            </figcaption>
          </figure>
        </section>

        <dl className="ae-facts lg-wrap" data-sc-in data-sc-stagger="60">
          <div>
            <dt className="lg-note">Based in</dt>
            <dd>Toronto, Canada</dd>
          </div>
          <div>
            <dt className="lg-note">Plays</dt>
            <dd>Full stack: React and TypeScript to Java, Python and the cloud</dd>
          </div>
          <div>
            <dt className="lg-note">Has played for</dt>
            <dd>CGI and Fiera Capital</dd>
          </div>
          <div>
            <dt className="lg-note">On the record</dt>
            <dd>{projects.length} projects, {slots} certifications</dd>
          </div>
        </dl>
      </div>

      {/* How he thinks: the sculpture, and the four habits */}
      <section className="ae-think" aria-labelledby="ae-think-title">
        <div className="lg-wrap ae-think__grid">
          <figure className="ae-think__art" data-sc-in>
            <Image
              src="/images/portraits/nizar-sculpture.webp"
              alt="A white marble bust of Nizar, one side breaking apart into glass cubes joined by thin lines of blue light"
              width={1100}
              height={1300}
              sizes="(max-width: 860px) 92vw, 34rem"
            />
          </figure>
          <div className="ae-think__copy">
            <header className="ae-head" data-sc-in>
              <p className="lg-note">search(position, <b>depth</b>)</p>
              <h2 id="ae-think-title" className="lg-display lg-display--lg">Four habits. Same on the board and in the codebase.</h2>
            </header>
            <ol className="ae-habits" data-sc-in data-sc-stagger="70">
              {HABITS.map((h, i) => (
                <li key={h.san}>
                  <span className="lg-note">{i + 1}. <b>{h.san}</b></span>
                  <h3 className="lg-display lg-display--sm">{h.chess}</h3>
                  <p>{h.code}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="ae-band tone-day tone-ground">
        <MyStory />
        <div className="ae-band__end" />
      </div>

      <AboutClient />

      <div className="ae-band ae-band--gap tone-day tone-ground">
        <Skills />

        <section className="ae-section lg-wrap" aria-labelledby="ae-studies-title">
          <header className="ae-head" data-sc-in>
            <h2 id="ae-studies-title" className="lg-display lg-display--lg">Where I studied.</h2>
          </header>
          <Education />
        </section>
        <div className="ae-band__end" />
      </div>

      <section id="certificates" className="ae-section ae-section--last lg-wrap" aria-labelledby="ae-wall-title">
        <header className="ae-head" data-sc-in>
          <h2 id="ae-wall-title" className="lg-display lg-display--lg">
            {reserved > 0 ? `${slots} frames. ${certificates.length} lit so far.` : `${slots} frames. Every one lit.`}
          </h2>
          <p className="lg-body">
            {reserved > 0
              ? `I hold ${slots} certifications. ${certificates.length} hang on the wall today, and each one opens larger. The other frames are reserved until the rest are scanned in.`
              : `I hold ${slots} certifications, and each one hangs here. Open any frame to read it properly.`}
          </p>
        </header>
        <div className="ae-wall-room">
          <CertificateWall certificates={certificates} slots={slots} />
        </div>
      </section>
    </div>
  )
}
