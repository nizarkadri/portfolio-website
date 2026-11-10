import type { Metadata } from 'next';
import ContactExperience from '../../../components/contact/ContactExperience';
import '../../blog-contact.css';

export const metadata: Metadata = {
  title: 'Your move',
  description: 'Tell Nizar Kadri what you are building, who you are hiring, or ask for his resume. The reply to the game is yours.',
};

export default function ContactPage() {
  return <ContactExperience />;
}
