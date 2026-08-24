import { PortableText, type PortableTextComponents } from "@portabletext/react";

type Block = {
  _type: string;
  _key: string;
  [key: string]: unknown;
};

interface LessonNotesProps {
  blocks: Block[] | null;
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[15px] text-neutral-700 leading-7 mb-4">{children}</p>
    ),
    h2: ({ children }) => (
      <h2
        className="text-xl font-bold text-neutral-900 mt-6 mb-3"
        style={{ fontFamily: "var(--font-playfair-display)" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold text-neutral-900 mt-5 mb-2">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold text-neutral-900 mt-4 mb-2">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary-300 pl-4 italic text-neutral-500 my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-outside ml-5 space-y-1 mb-4 text-[15px] text-neutral-700 leading-7">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-outside ml-5 space-y-1 mb-4 text-[15px] text-neutral-700 leading-7">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-neutral-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded text-[13px] font-mono">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const href = value?.href ?? "";
      const isExternal = href.startsWith("https://") || href.startsWith("http://");
      return (
        <a
          href={href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-primary-500 underline underline-offset-2 hover:text-primary-400 transition-colors"
        >
          {children}
        </a>
      );
    },
  },
};

export function LessonNotes({ blocks }: LessonNotesProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div>
      <h2
        className="text-xl font-bold text-neutral-900 mb-4"
        style={{ fontFamily: "var(--font-playfair-display)" }}
      >
        Overview
      </h2>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <PortableText value={blocks as any} components={components} />
    </div>
  );
}
