import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AboutClient from './AboutClient'
import { Chars } from '../../../components/Kinetic'
import Depth from '../../../components/about/Depth'
import StoryChapters from '../../../components/about/StoryChapters'
import Repertoire from '../../../components/about/Repertoire'
import PieceCanvas from '../../../components/marble/PieceCanvas'
import '../../about-experience.css'
import '../../about.css'

export const metadata: Metadata = {
  title: 'About Me - Full-Stack AI Engineer Journey',
  description: 'How a chess player and designer became a Full-Stack AI Engineer: the story, the problem-solving approach, and the AI tools I work with every day.',
  keywords: 'about Nizar Kadri, AI engineer, full-stack AI engineer, AI agents, agentic workflows, software engineer, Toronto, chess, problem solving',
  openGraph: {
    title: 'About Nizar Kadri - Full-Stack AI Engineer',
    description: 'How a chess player and designer became a Full-Stack AI Engineer in Toronto.',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Nizar Kadri - Full-Stack AI Engineer',
    description: 'How a chess player and designer became a Full-Stack AI Engineer in Toronto.',
    images: ['/og-image.jpg'],
  },
}

/**
 * About is the person: a title page with the portrait and a marble king in front of it, the story as three spreads
 * under a chapter name at poster size, the software he opens every day, and the live training numbers. Everything professional (results, stack,
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
          <figcaption className="lg-note ab2-hero__caption">Toronto · full-stack AI engineer · chess since childhood</figcaption>
          <div className="ab2-hero__king" data-depth="16"><PieceCanvas kind="king" tone="dark" turn={0.003} still={0.35} /></div>
        </figure>
      </Depth>

      <StoryChapters />

      {/* What he opens every day: six squares of one board, everything readable at once */}
      <Repertoire />

      {/* Live numbers on their own white ground */}
      <div className="ab2-band">
        <AboutClient />
      </div>
    </div>
  )
}
