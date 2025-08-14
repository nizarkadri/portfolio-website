// src/data/storyData.ts

// Define the type for a chapter
export interface StoryChapter {
    id: string;
    title: string;
    subtitle?: string;
    content: string[];
    principles?: { title: string; text: string }[];
  }
  
  // The story data itself
  export const storyData: StoryChapter[] = [
    {
      id: 'spark',
      title: "My Default Setting?",
      subtitle: "'There Has to Be a Better Way.'",
      content: [
        "Ever since I was a kid, I’ve been constitutionally allergic to the default settings. If a simple task required tedious, repetitive steps, I wasn't just annoyed—I felt a personal responsibility to fix it. This led me to my first Stack Overflow copy-paste: a shell script that renamed a mountain of files in a flash.",
        "It felt like magic. And it was the first spark."
      ],
    },
    {
      id: 'fusion',
      title: "Where Logic Met Design",
      content: [
        "Then came the web. I got hooked on HTML and CSS, but a pretty picture is useless without a purpose. That's when I met JavaScript.",
        "JavaScript was the brilliant best friend who made anything seem possible. I was in love. This is where my two halves clicked into place: the artist and the engineer. The ultimate achievement isn't just a system that works or a design that looks good. It's the seamless fusion of both.",
        
      ],
    },
    {
      id: 'manifesto',
      title: "The Nizar Manifesto",
      subtitle: "My Core Philosophy",
      principles: [
        { title: "Seductive by Design.", text: "The interface must be so visually appealing and engaging that users want to explore it." },
        { title: "Intuitive by Nature.", text: "The user experience must be so simple that no one ever feels lost or confused." },
        { title: "Ruthlessly Efficient.", text: "If something feels too complex, it is. I have a built-in 'there's a better way' alarm that won't shut up until I find a simpler, more elegant solution." }
      ],
      content: [
          "I don't care what language I have to learn or what tool I need to master. The tool serves the vision, not the other way around. This mindset has pushed me to teach myself everything from Unity to Android development. My confidence isn't arrogance; it's earned."
      ],
    },
    // {
    //   id: 'next-chapter',
    //   title: "The Next Chapter",
    //   content: [
    //     "I'm a unique blend of intelligence and art, with a proven history of tackling the impossible. Now, I'm on the hunt for my next opportunity—a team that values creativity, simplicity, and a relentless desire to build things that matter.",
    //     "Think my blend of artistic design and engineering simplicity is what you're missing? Let's talk."
    //   ],
    // }
  ];