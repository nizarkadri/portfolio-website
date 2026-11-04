import Image from 'next/image';
import type { BlogNode } from '../app/lib/blog-shared';
import { Fragment, type ReactNode } from 'react';

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

function kids(node: BlogNode): ReactNode {
  return (node.children ?? []).map((c, i) => <Node key={i} node={c} />);
}

function Node({ node }: { node: BlogNode }): ReactNode {
  switch (node.type) {
    case 'root': return <>{kids(node)}</>;
    case 'paragraph': return <p>{kids(node)}</p>;
    case 'heading': {
      const depth = Math.min(6, Math.max(1, node.depth ?? 2));
      const Tag = HEADINGS[depth - 1];
      return <Tag>{kids(node)}</Tag>;
    }
    case 'text': return <>{node.value}</>;
    case 'strong': return <strong>{kids(node)}</strong>;
    case 'emphasis': return <em>{kids(node)}</em>;
    case 'delete': return <del>{kids(node)}</del>;
    case 'inlineCode': return <code>{node.value}</code>;
    case 'code': return (
      <pre data-language={node.lang ?? undefined}><code>{node.value}</code></pre>
    );
    case 'link': return <a href={node.url} target={node.url?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{kids(node)}</a>;
    case 'image': return node.url ? (
      <Image src={node.url} alt={node.alt ?? ''} width={1200} height={675} className="rounded-2xl" />
    ) : <Fragment />;
    case 'blockquote': return <blockquote>{kids(node)}</blockquote>;
    case 'list': return node.ordered ? <ol>{kids(node)}</ol> : <ul>{kids(node)}</ul>;
    case 'listItem': return <li>{kids(node)}</li>;
    case 'thematicBreak': return <hr />;
    case 'break': return <br />;
    case 'table': return <table><tbody>{kids(node)}</tbody></table>;
    case 'tableRow': return <tr>{kids(node)}</tr>;
    case 'tableCell': return <td>{kids(node)}</td>;
    case 'html': return <Fragment />;
    default: return node.children ? <>{kids(node)}</> : <>{node.value}</>;
  }
}

export default function BlogArticle({ ast }: { ast: BlogNode }) {
  return (
    <div className="prose prose-invert prose-lg mt-10 max-w-none prose-headings:text-white prose-a:text-[#D9FF4B] prose-strong:text-white prose-code:text-[#D9FF4B]">
      <Node node={ast} />
    </div>
  );
}
