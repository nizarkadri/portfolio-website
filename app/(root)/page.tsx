import fs from 'fs';
import path from 'path';
import { getSortedProjectsData } from '../lib/projects';
import { PROJECT_PLACEHOLDER_IMAGE } from '../lib/project-shared';
import Landing, { LandingDoor } from '../../components/world/Landing';
import { CERTIFICATE_SLOTS, getCertificates } from '../../components/about/certificates';

const Home = async () => {
  const projects = await getSortedProjectsData();
  // The landing page shows three doors; this site itself is not one of them.
  const featured = projects.filter((p) => p.featured && p.slug !== 'portfolio-website').slice(0, 3);
  const cover = (url: string) => (url === PROJECT_PLACEHOLDER_IMAGE ? '' : url);
  // A portrait image made for the doorway, when one exists; otherwise the regular cover.
  const doorCover = (slug: string, url: string) =>
    fs.existsSync(path.join(process.cwd(), 'public/images/Projects/doors', `${slug}.webp`)) ? `/images/Projects/doors/${slug}.webp` : cover(url);

  const doors: LandingDoor[] = featured.map((p) => ({
    slug: p.slug,
    title: p.title.split(/\s+[-—]\s+|:\s+/)[0],
    summary: p.summary,
    technologies: p.technologies,
    cover: doorCover(p.slug, p.imageUrl),
    liveUrl: p.liveUrl,
  }));

  const certificates = getCertificates();
  const tower = [...certificates.map((c) => c.src), ...projects.map((p) => cover(p.imageUrl)).filter(Boolean)];

  return <Landing doors={doors} tower={tower} projectCount={projects.length} certificateCount={Math.max(CERTIFICATE_SLOTS, certificates.length)} />;
};

export default Home;
