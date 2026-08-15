import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-gray-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mt-3 mb-2 border-b border-white/10 pb-1" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm sm:text-base font-bold text-cyan-300 mt-2.5 mb-1.5 flex items-center gap-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-purple-300 mt-2 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-2 leading-relaxed text-gray-300" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-500/20" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="text-cyan-200 italic" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 mb-2.5 text-gray-300 pl-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2.5 text-gray-300 pl-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-xs sm:text-sm text-gray-200" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-cyan-400/60 pl-3 py-1 my-2 bg-white/[0.02] rounded-r-lg text-gray-300 italic text-xs" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-black/50 text-cyan-300 font-mono text-[11px] border border-white/10" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3 my-2.5 rounded-xl bg-black/60 border border-white/10 overflow-x-auto text-[11px] font-mono text-cyan-200">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-white/10">
              <table className="min-w-full text-left text-xs text-gray-300 border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-white/5 border-b border-white/10 text-cyan-300 font-semibold" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-xs font-bold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 border-t border-white/5 text-gray-200" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-cyan-400 hover:text-cyan-300 underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-3 border-white/10" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
