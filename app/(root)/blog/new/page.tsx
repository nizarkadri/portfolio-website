import type { Metadata } from 'next';
import BlogEditor from '../../../../components/BlogEditor';

export const metadata: Metadata = { title: 'New Post — Blog Editor', description: 'Draft a new blog post locally and download it as Markdown.' };

export default function NewPostPage() {
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#D9FF4B]">Blog · Editor</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white md:text-6xl">New post</h1>
        </header>
        <BlogEditor />
      </div>
    </div>
  );
}
