import type { Metadata } from 'next';
import BlogEditor from '../../../../components/BlogEditor';
import '../../../blog-contact.css';

export const metadata: Metadata = { title: 'New Post: Blog Editor', description: 'Draft a new blog post locally and download it as Markdown.' };

export default function NewPostPage() {
  return (
    <div className="lg-page bl">
      <div className="lg-wrap">
        <header className="bl-head">
          <p className="lg-note">Blog <b>/</b> Editor</p>
          <h1 className="lg-display lg-display--lg">New post</h1>
        </header>
        <BlogEditor />
      </div>
    </div>
  );
}
