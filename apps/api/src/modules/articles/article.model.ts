import { ARTICLE_SOURCES, ARTICLE_STATUSES, LANGUAGES } from '@devpraxis/shared';
import { Schema, model, type InferSchemaType } from 'mongoose';

const articleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
      required: true,
      index: true,
    },
    language: { type: String, enum: LANGUAGES, required: true },
    status: { type: String, enum: ARTICLE_STATUSES, default: 'draft', index: true },
    publishedAt: { type: Date },
    source: { type: String, enum: ARTICLE_SOURCES, default: 'manual' },
    translationOf: { type: Schema.Types.ObjectId, ref: 'Article' },
    favoritesCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

articleSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const { _id, ...rest } = ret;
    return { id: String(_id), ...rest };
  },
});

articleSchema.index({ title: 'text', content: 'text' });

articleSchema.index(
  { translationOf: 1, language: 1 },
  { unique: true, partialFilterExpression: { translationOf: { $type: 'objectId' } } },
);

export type Article = InferSchemaType<typeof articleSchema>;
export const ArticleModel = model('Article', articleSchema);
