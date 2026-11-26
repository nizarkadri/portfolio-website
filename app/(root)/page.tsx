import { getSortedProjectsData } from '../lib/projects';
import { PROJECT_PLACEHOLDER_IMAGE } from '../lib/project-shared';
import { siteMetadata } from '../lib/metadata';
import Landing from '../../components/world/Landing';
import { CERTIFICATE_SLOTS, getCertificates } from '../../components/about/certificates';

// Who the site is about, in the form search engines read: the job title and what he works on.
const base = siteMetadata.metadataBase ?? new URL('https://nizarsway.com');
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Nizar Kadri',
  jobTitle: 'Full-Stack AI Engineer',
  url: base.toString(),
  image: new URL('/images/portraits/nizar-hero.webp', base).toString(),
  address: { '@type': 'PostalAddress', addressLocality: 'Toronto', addressRegion: 'ON', addressCountry: 'CA' },
  knowsAbout: [
    'AI engineering', 'Large language models', 'Retrieval-augmented generation', 'AI agents', 'Agent orchestration',
    'Context engineering', 'Model Context Protocol', 'Next.js', 'TypeScript', 'Python', 'Google Cloud', 'Flutter',
  ],
  sameAs: ['https://github.com/nizarkadri', 'https://linkedin.com/in/nizarkadri'],
};

const Home = async () => {
  const projects = await getSortedProjectsData();
  const cover = (url: string) => (url === PROJECT_PLACEHOLDER_IMAGE ? '' : url);

  // The tower holds everything built and earned: the certificates, and the cover of every project.
  const certificates = getCertificates();
  const tower = [...certificates.map((c) => c.src), ...projects.map((p) => cover(p.imageUrl)).filter(Boolean)];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <Landing tower={tower} projectCount={projects.length} certificateCount={Math.max(CERTIFICATE_SLOTS, certificates.length)} />
    </>
  );
};

export default Home;
