// The story, in his words. Punctuation tidied; nothing invented.

export interface StoryChapter {
  id: string;
  /** The phase of the game this chapter belongs to. */
  phase: string;
  title: string;
  content: string[];
  principles?: { title: string; text: string }[];
  closing?: string[];
}

export const storyData: StoryChapter[] = [
  {
    id: 'spark',
    phase: 'Opening',
    title: 'My default setting? There has to be a better way.',
    content: [
      "Ever since I was a kid, I've been constitutionally allergic to the default settings. If a simple task required tedious, repetitive steps, I wasn't just annoyed. I felt a personal responsibility to fix it. This led me to my first Stack Overflow copy-paste: a shell script that renamed a mountain of files in a flash.",
      'It felt like magic. And it was the first spark.',
    ],
  },
  {
    id: 'fusion',
    phase: 'Middlegame',
    title: 'Where logic met design.',
    content: [
      "Then came the web. I got hooked on HTML and CSS, but a pretty picture is useless without a purpose. That's when I met JavaScript.",
      "JavaScript was the brilliant best friend who made anything seem possible. I was in love. This is where my two halves clicked into place: the artist and the engineer. The ultimate achievement isn't just a system that works or a design that looks good. It's the seamless fusion of both.",
    ],
  },
  {
    id: 'manifesto',
    phase: 'Endgame',
    title: 'The Nizar manifesto.',
    content: [],
    principles: [
      { title: 'Seductive by design.', text: 'The interface must be so visually appealing and engaging that users want to explore it.' },
      { title: 'Intuitive by nature.', text: 'The user experience must be so simple that no one ever feels lost or confused.' },
      {
        title: 'Ruthlessly efficient.',
        text: 'If something feels too complex, it is. I have a built-in "there\'s a better way" alarm that won\'t shut up until I find a simpler, more elegant solution.',
      },
    ],
    closing: [
      "I don't care what language I have to learn or what tool I need to master. The tool serves the vision, not the other way around. This mindset has pushed me to teach myself everything from Unity to Android development. My confidence isn't arrogance; it's earned.",
    ],
  },
];
