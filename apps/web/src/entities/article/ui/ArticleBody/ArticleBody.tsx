import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import styles from './ArticleBody.module.css';

const REHYPE_PLUGINS = [rehypeRaw, rehypeSanitize, rehypeSlug, rehypeHighlight];
const REMARK_PLUGINS = [remarkGfm];

interface IProps {
  content: string;
}

export function ArticleBody({ content }: IProps) {
  return (
    <div className={styles.prose}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={{
          a: ({ href, children, ...rest }) => {
            const isExternal = typeof href === 'string' && /^https?:\/\//.test(href);

            return (
              <a
                href={href}
                {...rest}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
