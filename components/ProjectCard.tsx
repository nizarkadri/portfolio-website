import Image from "next/image";
import Link from "next/link";

interface ProjectCardProps {
    title: string;
    description: string;
    imageUrl: string;
    slug: string;
    technologies: string[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({title, description, imageUrl, slug, technologies}) => {
    return (
        <div className="group h-full flex flex-col transition-all duration-500 bg-soft-black/40 hover:bg-soft-black/60 rounded-lg overflow-hidden backdrop-blur-sm border border-white/5 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10">
            <div className="relative overflow-hidden aspect-video">
                <Link href={`/projects/${slug}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 icon-3d">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                    </div>
                    <Image 
                        src={imageUrl} 
                        alt={title} 
                        width={500} 
                        height={300} 
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
                        placeholder="blur" 
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
                    />
                </Link>
            </div>
            <div className="p-6 flex flex-col flex-grow relative">
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="relative">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                            <Link href={`/projects/${slug}`} className="hover:text-blue-400 transition-colors">
                                {title}
                            </Link>
                        </h3>
                        <div className="icon-3d p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="#3b82f6">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    
                    <p className="text-soft-gray mb-6 line-clamp-3">{description}</p>
                    
                    <div className="flex flex-wrap mt-auto">
                        {technologies.map((tech) => {
                            // Get a unique color for each technology
                            const colors = [
                                "#4f46e5", // Indigo
                                "#10b981", // Emerald
                                "#f59e0b", // Amber
                                "#ec4899", // Pink
                                "#3b82f6", // Blue
                                "#ef4444", // Red
                                "#8b5cf6", // Violet
                            ];
                            
                            const colorIndex = technologies.indexOf(tech) % colors.length;
                            
                            return (
                                <span
                                    key={tech}
                                    className="inline-flex items-center m-1 px-3 py-1 text-xs font-medium rounded-full bg-black/30 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300"
                                    style={{ color: colors[colorIndex] }}
                                >
                                    {tech}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;