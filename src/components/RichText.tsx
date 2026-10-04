import { Fragment } from 'react';

// {1,64}: the longest valid local part. Without a limit, a long cell with no spaces takes about a second.
const LINK = /(https:\/\/[^\s<>"]+[^\s<>".,;:!?)]|[\w.+-]{1,64}@[\w-]+\.[\w.-]*\w)/g;

/** Text with https links and email addresses turned into links. */
export function Linked({ text }: { text: string }) {
  return (
    <>
      {text.split(LINK).map((part, i) =>
        i % 2 === 0 ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <a
            key={i}
            href={part.startsWith('https://') ? part : `mailto:${part}`}
            className="underline underline-offset-4"
            {...(part.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {part}
          </a>
        ),
      )}
    </>
  );
}

/** One sheet cell: lines that start with "- " become a list, other lines become paragraphs. */
export function RichText({ text, className = '', listClassName = 'list-disc pl-[21px] lg:pl-[27px]' }: { text: string; className?: string; listClassName?: string }) {
  const blocks: { list: boolean; lines: string[] }[] = [];
  for (const line of text.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const list = /^[-•]\s+/.test(line);
    const clean = line.replace(/^[-•]\s+/, '');
    const last = blocks.at(-1);
    if (last && last.list && list) last.lines.push(clean);
    else blocks.push({ list, lines: [clean] });
  }
  return (
    <div className={className}>
      {blocks.map((b, i) =>
        b.list ? (
          <ul key={i} className={listClassName}>
            {b.lines.map((l, j) => (
              <li key={j}>
                <Linked text={l} />
              </li>
            ))}
          </ul>
        ) : (
          b.lines.map((l, j) => (
            <p key={`${i}-${j}`}>
              <Linked text={l} />
            </p>
          ))
        ),
      )}
    </div>
  );
}
