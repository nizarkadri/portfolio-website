import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AboutClient from './AboutClient'
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
      <section className="ae-hero lg-wrap" aria-labelledby="ae-about-title">
        <div className="ae-hero__copy">
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
              src="/images/portraits/nizar-coat.webp"
              alt="Nizar Kadri in a black coat and turtleneck, photographed against a dark studio wall"
              fill
              priority
              sizes="(max-width: 860px) 70vw, 29rem"
            />
          </div>
          <figcaption className="lg-note ae-pgn">
            <span>[White &quot;Kadri, Nizar&quot;]</span>
            <span>[Site &quot;Toronto, Canada&quot;]</span>
          </figcaption>
        </figure>
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
          <div className="ae-wall__foot">
            <Image
              className="ae-wall__figure"
              src="/images/portraits/figure.webp"
              alt="Nizar Kadri standing at the foot of the wall, hands in his pockets"
              width={423}
              height={987}
              sizes="10rem"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
