import { startSession, type QueryFilter } from 'mongoose';

import { ApiError } from '#utils/ApiError';
import { ensureUniqueSlug } from '#utils/slug';
import { ArticleModel, type Article, type ArticleSource } from '#modules/articles/article.model';
import { TopicModel } from '#modules/topics/topic.model';
import { UserModel } from '#modules/users/user.model';

import type {
  CreateArticleDto,
  FeedQuery,
  UpdateArticleDto,
} from '#modules/articles/article.schemas';

/* helpers */

async function assertTopicsExist(topicIds: string[]): Promise<void> {
  const found = await TopicModel.countDocuments({ _id: { $in: topicIds } });
  if (found !== new Set(topicIds).size) {
    throw ApiError.badRequest('One or more topics do not exist');
  }
}

async function findOwnedArticle(id: string, userId: string) {
  const article = await ArticleModel.findById(id);
  if (!article) throw ApiError.notFound('Article not found');
  if (String(article.authorId) !== userId) {
    throw ApiError.forbidden('Only the author can modify this article');
  }
  return article;
}

const articleSlugTaken = async (slug: string) =>
  Boolean(await ArticleModel.exists({ slug }));

/* public API */
export async function listPublished(q: FeedQuery) {
  const filter: QueryFilter<Article> = { status: 'published' };
  if (q.topicId) filter.topicIds = q.topicId;
  if (q.language) filter.language = q.language;
  if (q.authorId) filter.authorId = q.authorId;
  if (q.search) filter.$text = { $search: q.search };

  const sort =
    q.sort === 'popular'
      ? ({ favoritesCount: -1, publishedAt: -1 } as const)
      : ({ publishedAt: -1 } as const);

  const [items, total] = await Promise.all([
    ArticleModel.find(filter)
      .sort(sort)
      .skip((q.page - 1) * q.limit)
      .limit(q.limit),
    ArticleModel.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      total,
      page: q.page,
      pages: Math.ceil(total / q.limit)
    }
  };
}

export async function getPublishedByIdOrSlug(idOrSlug: string) {
  const isObjectId = /^[0-9a-f]{24}$/i.test(idOrSlug);
  const article = await ArticleModel.findOne(
    isObjectId ? { _id: idOrSlug, status: 'published' } : { slug: idOrSlug, status: 'published' },
  );
  if (!article) throw ApiError.notFound('Article not found');
  return article;
}

export async function listMine(userId: string) {
  return ArticleModel.find({ authorId: userId }).sort({ updatedAt: -1 });
}

export async function createArticle(
  userId: string,
  dto: CreateArticleDto,
  source: ArticleSource = 'manual',
  extra?: { translationOf?: string }
) {
  await assertTopicsExist(dto.topicIds);
  const slug = await ensureUniqueSlug(dto.title, articleSlugTaken);
  return ArticleModel.create({
    ...dto,
    slug,
    authorId: userId,
    source,
    ...(extra?.translationOf ? { translationOf: extra.translationOf } : {}),
  });
}

export async function updateArticle(id: string, userId: string, dto: UpdateArticleDto) {
  const article = await findOwnedArticle(id, userId);
  if (dto.topicIds) await assertTopicsExist(dto.topicIds);
  article.set(dto);
  return article.save();
}

export async function setPublished(id: string, userId: string, publish: boolean) {
  const article = await findOwnedArticle(id, userId);
  article.status = publish ? 'published' : 'draft';
  if (publish && !article.publishedAt) article.publishedAt = new Date();
  return article.save();
}

export async function deleteArticle(id: string, userId: string) {
  await findOwnedArticle(id, userId);

  const session = await startSession();
  try {
    await session.withTransaction(async () => {
      await ArticleModel.deleteOne({ _id: id }, { session });

      await UserModel.updateMany(
        { favorites: id },
        { $pull: { favorites: id } },
        { session },
      );

      await ArticleModel.updateMany(
        { translationOf: id },
        { $unset: { translationOf: '' } },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
}

export async function setFavorite(articleId: string, userId: string, on: boolean) {
  const exists = await ArticleModel.exists({ _id: articleId, status: 'published' });
  if (!exists) throw ApiError.notFound('Published article not found');

  const res = on
    ? await UserModel.updateOne(
      { _id: userId, favorites: { $ne: articleId } },
      { $addToSet: { favorites: articleId } },
    )
    : await UserModel.updateOne(
      { _id: userId, favorites: articleId },
      { $pull: { favorites: articleId } },
    );

  if (res.modifiedCount > 0) {
    await ArticleModel.updateOne({ _id: articleId }, { $inc: { favoritesCount: on ? 1 : -1 } });
  }
}

export async function listFavorites(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return ArticleModel.find({ _id: { $in: user.favorites }, status: 'published' });
}
