export interface ArticleFormState {
  status: 'idle' | 'error';
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: {
    title?: string;
    content?: string;
    pageId?: string;
    topicIds?: string[];
    language?: string;
  };
}

export const INITIAL_ARTICLE_STATE: ArticleFormState = { status: 'idle' };
