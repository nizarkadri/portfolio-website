import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AboutClient from './AboutClient'
import { Chars } from '../../../components/Kinetic'
import MyStory from '../../../components/MyStory'
import Skills from '../../../components/Skills'
import Education from '../../../components/about/Education'
import CertificateWall from '../../../components/about/CertificateWall'
import { CERTIFICATE_SLOTS, getCertificates } from '../../../components/about/certificates'
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

export default function AboutPage() {
  const certificates = getCertificates()
  const slots = Math.max(CERTIFICATE_SLOTS, certificates.length)
  const reserved = slots - certificates.length

  return (
    <div className="ae lg-page">
      {/* The player */}
      <section className="ab-hero lg-wrap" aria-labelledby="ae-about-title">
        <div className="ab-hero__copy">
          <p className="lg-note hero__eyebrow lg-up"><i aria-hidden="true" />About</p>
          <h1 id="ae-about-title" className="lg-display ab-hero__title"><Chars text={'The player\nbehind the board.'} /></h1>
          <p className="lg-body lg-body--lg lg-up" style={{ ['--d' as string]: 720 }}>
            I&rsquo;m Nizar Kadri, a full stack developer in Toronto. I have played chess since I was a child, and I
            build software the same way: the whole board first, then the move.
          </p>
          <div className="ab-hero__links lg-up" style={{ ['--d' as string]: 860 }}>
            <Link href="#certificates" className="ab-pill ab-pill--ink">The certificates</Link>
            <Link href="/experience" className="ab-pill">Full experience</Link>
          </div>
        </div>
        <figure className="ab-hero__figure">
          <Image
            src="/images/portraits/nizar-hero.webp"
            alt="Nizar Kadri in a dark navy jacket, looking to one side, against a pale blue studio wall"
            fill
            priority
            sizes="(max-width: 860px) 100vw, 46vw"
          />
          <figcaption>
            <ul className="ab-hero__pills">
              <li className="lg-up" style={{ ['--d' as string]: 1000 }}>Toronto</li>
              <li className="lg-up" style={{ ['--d' as string]: 1100 }}>Full stack and AI</li>
              <li className="lg-up" style={{ ['--d' as string]: 1200 }}>Chess since childhood</li>
            </ul>
          </figcaption>
        </figure>
      </section>

      {/* The record, in four numbers. Each one is from the work itself. */}
      <section className="ab-stats lg-wrap" aria-label="In numbers">
        <dl data-sc-in data-sc-stagger="90">
          <div>
            <dt><span data-sc-count="0 70">70</span>%</dt>
            <dd>faster pages on Ontario&rsquo;s SEDAR Plus portal, at CGI</dd>
          </div>
          <div>
            <dt><span data-sc-count="0 98">98</span>%</dt>
            <dd>WCAG 2.1 compliance on the same portal</dd>
          </div>
          <div>
            <dt><span data-sc-count="0 20">20</span>+</dt>
            <dd>on-premise servers moved to Azure, at Fiera Capital</dd>
          </div>
          <div>
            <dt><span data-sc-count={`0 ${slots}`}>{slots}</span></dt>
            <dd>certifications, every one on the wall below</dd>
          </div>
        </dl>
      </section>

      <MyStory />

      <AboutClient />

      <Skills />

      <section className="ae-section lg-wrap" aria-labelledby="ae-studies-title">
        <header className="ae-head" data-sc-in>
          <h2 id="ae-studies-title" className="lg-display lg-display--lg">Where I studied.</h2>
        </header>
        <Education />
      </section>

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
