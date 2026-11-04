import { getFeaturedProjectsData } from '../lib/projects';

import Skills from '../../components/Skills';
import Hero from '../../components/Hero';
import Projects from '../../components/Projects';
// import Experience from '../../components/Experience';
import CompanyMarquee from '../../components/CompanyMarquee';
import BlogPreview from '../../components/BlogPreview';
import { getAllPosts } from '../lib/blog';

const Home = async () => {
  const featuredProjects = await getFeaturedProjectsData(3);
  const latestPosts = (await getAllPosts()).slice(0, 3);

  return (
    <div className="page-transition">
      
        {/* Hero Section */}
        <Hero />

        {/* Skills Section */}
        <Skills />

        {/* Company Marquee Section */}
        <CompanyMarquee />

        {/* Experience Preview Section */}
        {/* <Experience /> */}
        
        {/* Projects Preview Section */}
        <Projects projects={featuredProjects} />

        {/* Blog Preview Section */}
        <BlogPreview posts={latestPosts} />
      
    </div>
  );
};

export default Home;