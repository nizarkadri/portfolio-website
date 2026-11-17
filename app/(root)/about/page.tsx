import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AboutClient from './AboutClient'
import { Chars } from '../../../components/Kinetic'
import Depth from '../../../components/about/Depth'
import StoryChapters from '../../../components/about/StoryChapters'
import PieceCanvas from '../../../components/marble/PieceCanvas'
import '../../about-experience.css'
import '../../about.css'

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

/**
 * About is the person: a title page with the portrait and a marble king in front of it, the story as three spreads
 * under a chapter name at poster size, and the live training numbers. Everything professional (results, stack,
 * degrees, certificates) is on the experience page.
 */
export default function AboutPage() {
  return (
    <div className="ab2">
      {/* The title page: the heading at the front, the portrait set back, the king nearest of all */}
      <Depth className="ab2-hero lg-wrap">
        <div className="ab2-hero__copy">
          <p className="lg-note ab2-folio lg-up">About</p>
          <h1 id="ae-about-title" className="lg-display ab2-hero__title"><Chars text={'The player\nbehind the board.'} /></h1>
          <div className="ab2-hero__links lg-up" style={{ ['--d' as string]: 760 }}>
            <Link href="/experience#certificates" className="ab-pill ab-pill--ink">The certificates</Link>
            <Link href="/experience" className="ab-pill">Full experience</Link>
          </div>
        </div>
        <figure className="ab2-hero__figure">
          <div className="ab2-hero__frame" data-depth="-14">
            <Image src="/images/portraits/nizar-hero.webp" alt="Nizar Kadri in a dark navy jacket, looking to one side, against a pale blue studio wall"
              fill priority sizes="(max-width: 860px) 100vw, 44vw" />
          </div>
          <figcaption className="lg-note ab2-hero__caption">Toronto · full stack and AI · chess since childhood</figcaption>
          <div className="ab2-hero__king" data-depth="16"><PieceCanvas kind="king" tone="dark" turn={0.003} still={0.35} /></div>
        </figure>
      </Depth>

      <StoryChapters />

      {/* Live numbers on their own white ground */}
      <div className="ab2-band">
        <AboutClient />
      </div>
    </div>
  )
}
