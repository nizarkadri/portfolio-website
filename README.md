# Personal Portfolio Website

A modern, dynamic portfolio website built with Next.js 15.2.2, React 19, and Tailwind CSS, featuring a futuristic design with interactive 3D elements, smooth animations, and advanced performance optimizations.

## Features

- 🎨 Modern, futuristic UI design with animated backgrounds and grid patterns
- 💫 Interactive 3D elements using Three.js and React Three Fiber
- 🎭 Smooth animations powered by Framer Motion
- 📱 Fully responsive layout with mobile-first approach
- 🚀 Server-side rendering and API routes using Next.js 15.2.2
- 📂 Dynamic project showcase with detailed case studies
- ⚡ Optimized performance with next/image and static assets
- 📧 Contact form with email integration using Resend
- 🔍 SEO optimized with dynamic sitemap and robots.txt
- 🎯 Type-safe development with TypeScript
- 🐳 Docker support for containerized deployment

## Tech Stack

### Core Technologies
- **Frontend Framework:** Next.js 15.2.2 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS with Typography plugin
- **Language:** TypeScript

### Key Libraries
- **3D Rendering:** Three.js, React Three Fiber, Drei
- **Animations:** Framer Motion
- **Form Handling:** React Hook Form with Zod validation
- **Email:** Resend, Nodemailer
- **Content Processing:** Gray Matter, Remark
- **UI Utilities:** clsx, tailwind-merge
- **Smooth Scrolling:** Lenis

### Development Tools
- **Package Manager:** npm
- **Linting:** ESLint
- **Containerization:** Docker
- **Deployment:** Vercel

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd portfolio-website
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

- The project uses Turbopack for faster development builds
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Docker for containerization

## Performance & SEO

Check out the [PERFORMANCE_SEO_GUIDE.md](./PERFORMANCE_SEO_GUIDE.md) for detailed information about performance optimizations and SEO best practices implemented in this project.

## Deployment

The project can be deployed in multiple ways:

1. **Google Cloud Platform (GCP) - Current Deployment**
   - Deployed on Google Cloud Run for containerized applications
   - Benefits:
     - Auto-scaling capabilities
     - Pay-per-use pricing
     - Global load balancing
     - Integrated monitoring and logging
  

2. **Vercel (Alternative)**
   - Zero-config deployment
   - Automatic preview deployments
   - Edge network optimization

3. **Docker (Local)**
   - Build the container: `docker build -t portfolio-website .`
   - Run the container: `docker run -p 3000:3000 portfolio-website`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Three.js Documentation](https://threejs.org/docs)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
