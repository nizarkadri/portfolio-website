module.exports = {

"[project]/.next-internal/server/app/(pages)/projects/[slug]/page/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/app/not-found.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/app/not-found.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/app/(pages)/projects/[slug]/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// app/projects/[slug]/page.tsx
__turbopack_context__.s({
    "default": (()=>ProjectPage),
    "generateMetadata": (()=>generateMetadata)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
;
;
;
function ProjectPage({ params }) {
    // Mock project data (in a real app, this would come from an API or database)
    const projects = [
        {
            id: 1,
            title: 'E-Commerce Platform',
            description: 'A modern e-commerce platform built with React, Node.js, and MongoDB.',
            technologies: [
                'React',
                'Node.js',
                'MongoDB',
                'Express'
            ],
            image: '/images/project-placeholder.jpg',
            slug: 'e-commerce-platform',
            content: `
                <p>This e-commerce platform is designed to provide a seamless shopping experience for users. The application includes features such as user authentication, product browsing, shopping cart functionality, and secure checkout.</p>
                <h3>Key Features</h3>
                <ul>
                    <li>User authentication and profile management</li>
                    <li>Product catalog with filtering and search capabilities</li>
                    <li>Shopping cart and checkout process</li>
                    <li>Order history and tracking</li>
                    <li>Admin dashboard for product and order management</li>
                </ul>
                <h3>Technical Implementation</h3>
                <p>The frontend is built with React, utilizing Redux for state management and styled with Tailwind CSS. The backend is implemented with Node.js and Express, with MongoDB as the database. The application uses JWT for authentication and Stripe for payment processing.</p>
            `
        },
        {
            id: 2,
            title: 'Task Management App',
            description: 'A collaborative task management application with real-time updates.',
            technologies: [
                'React',
                'Firebase',
                'Tailwind CSS'
            ],
            image: '/images/project-placeholder.jpg',
            slug: 'task-management-app',
            content: `
                <p>This task management application helps teams collaborate effectively by providing a centralized platform for task assignment and tracking. The app supports real-time updates, ensuring all team members stay informed about task progress.</p>
                <h3>Key Features</h3>
                <ul>
                    <li>Real-time task updates and notifications</li>
                    <li>Task assignment and deadline tracking</li>
                    <li>Project organization and categorization</li>
                    <li>Team collaboration with comments and attachments</li>
                    <li>Progress tracking and reporting</li>
                </ul>
                <h3>Technical Implementation</h3>
                <p>The application is built with React for the frontend, utilizing Firebase for real-time database, authentication, and hosting. The UI is styled with Tailwind CSS for a responsive and modern design. Cloud Functions are used for background processing and notifications.</p>
            `
        },
        {
            id: 3,
            title: 'Portfolio Website',
            description: 'A personal portfolio website showcasing my skills and projects.',
            technologies: [
                'Next.js',
                'TypeScript',
                'Tailwind CSS'
            ],
            image: '/images/project-placeholder.jpg',
            slug: 'portfolio-website',
            content: `
                <p>This portfolio website serves as a showcase of my skills, projects, and professional experience. The site is designed to provide visitors with an overview of my capabilities and the work I've done.</p>
                <h3>Key Features</h3>
                <ul>
                    <li>Responsive design for optimal viewing on all devices</li>
                    <li>Project showcase with detailed descriptions</li>
                    <li>Skills and expertise highlighting</li>
                    <li>Contact form for potential clients or employers</li>
                    <li>Modern and minimalist UI with smooth animations</li>
                </ul>
                <h3>Technical Implementation</h3>
                <p>The website is built with Next.js for server-side rendering and optimal performance. TypeScript is used for type safety and better developer experience. The UI is styled with Tailwind CSS for a customized and responsive design. Deployment is handled through Vercel for continuous integration and delivery.</p>
            `
        }
    ];
    const project = projects.find((p)=>p.slug === params.slug);
    if (!project) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen py-20",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container mx-auto px-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: "/projects",
                    className: "text-white/70 hover:text-white flex items-center mb-8 text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            className: "mr-2 h-4 w-4",
                            viewBox: "0 0 20 20",
                            fill: "currentColor",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                fillRule: "evenodd",
                                d: "M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z",
                                clipRule: "evenodd"
                            }, void 0, false, {
                                fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                                lineNumber: 91,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                            lineNumber: 90,
                            columnNumber: 21
                        }, this),
                        "Back to Projects"
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                    lineNumber: 89,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-gradient-to-b from-soft-black/40 to-soft-black/10 rounded-2xl p-8 md:p-12 backdrop-blur-sm border border-white/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-4xl md:text-5xl font-bold mb-6 text-white",
                            children: project.title
                        }, void 0, false, {
                            fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                            lineNumber: 97,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-2 mb-8",
                            children: project.technologies.map((tech, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm bg-white/10 text-white/70 px-3 py-1 rounded-full",
                                    children: tech
                                }, index, false, {
                                    fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                                    lineNumber: 101,
                                    columnNumber: 29
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                            lineNumber: 99,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-64 bg-gray-800 rounded-xl mb-8 relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 flex items-center justify-center text-white/30 text-xl font-medium",
                                    children: [
                                        project.title,
                                        " - Preview Image"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                                    lineNumber: 108,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 bg-gradient-to-t from-deep-black to-transparent opacity-50 rounded-xl"
                                }, void 0, false, {
                                    fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                                    lineNumber: 111,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                            lineNumber: 107,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "prose prose-invert max-w-none prose-p:text-soft-white/80 prose-headings:text-white prose-li:text-soft-white/70",
                            dangerouslySetInnerHTML: {
                                __html: project.content
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                            lineNumber: 114,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
                    lineNumber: 96,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
            lineNumber: 88,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(pages)/projects/[slug]/page.tsx",
        lineNumber: 87,
        columnNumber: 9
    }, this);
}
async function generateMetadata({ params }) {
    // Use the same projects array to find the project for metadata
    const projects = [
        {
            id: 1,
            title: 'E-Commerce Platform',
            description: 'A modern e-commerce platform built with React, Node.js, and MongoDB.',
            technologies: [
                'React',
                'Node.js',
                'MongoDB',
                'Express'
            ],
            slug: 'e-commerce-platform'
        },
        {
            id: 2,
            title: 'Task Management App',
            description: 'A collaborative task management application with real-time updates.',
            technologies: [
                'React',
                'Firebase',
                'Tailwind CSS'
            ],
            slug: 'task-management-app'
        },
        {
            id: 3,
            title: 'Portfolio Website',
            description: 'A personal portfolio website showcasing my skills and projects.',
            technologies: [
                'Next.js',
                'TypeScript',
                'Tailwind CSS'
            ],
            slug: 'portfolio-website'
        }
    ];
    const project = projects.find((p)=>p.slug === params.slug);
    if (!project) {
        return {
            title: 'Project Not Found'
        };
    }
    return {
        title: project.title,
        description: project.description
    };
}
}}),
"[project]/app/(pages)/projects/[slug]/page.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/app/(pages)/projects/[slug]/page.tsx [app-rsc] (ecmascript)"));
}}),

};

//# sourceMappingURL=_988d9106._.js.map