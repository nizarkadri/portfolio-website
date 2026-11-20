import { getSortedProjectsData } from '../lib/projects';
import { PROJECT_PLACEHOLDER_IMAGE } from '../lib/project-shared';
import Landing from '../../components/world/Landing';
import { CERTIFICATE_SLOTS, getCertificates } from '../../components/about/certificates';

const Home = async () => {
  const projects = await getSortedProjectsData();
  const cover = (url: string) => (url === PROJECT_PLACEHOLDER_IMAGE ? '' : url);

  // The tower holds everything built and earned: the certificates, and the cover of every project.
  const certificates = getCertificates();
  const tower = [...certificates.map((c) => c.src), ...projects.map((p) => cover(p.imageUrl)).filter(Boolean)];

  return <Landing tower={tower} projectCount={projects.length} certificateCount={Math.max(CERTIFICATE_SLOTS, certificates.length)} />;
};

export default Home;
