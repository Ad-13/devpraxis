import { startSession, type QueryFilter } from 'mongoose';

import { ApiError } from '#utils/ApiError';
import { ensureUniqueSlug } from '#utils/slug';
import { ArticleModel, type Article } from '#modules/articles/article.model';
import { TopicModel } from '#modules/topics/topic.model';
import { UserModel } from '#modules/users/user.model';

import type {
  ArticleSource,
  CreateArticleDto,
  FeedQuery,
  MyArticlesQuery,
  UpdateArticleDto,
} from '@devpraxis/shared';

/* helpers */

const LIST_PROJECTION = '-content';

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

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function viewerFavourites(viewerId?: string): Promise<Set<string>> {
  if (!viewerId) return new Set();

  const viewer = await UserModel.findById(viewerId).select('favorites').lean();
  return new Set((viewer?.favorites ?? []).map(String));
}

/* public API */
export async function listPublished(q: FeedQuery, viewerId?: string) {
  const filter: QueryFilter<Article> = { status: 'published' };

  if (q.topicId) filter.topicIds = q.topicId;
  if (q.language) filter.language = q.language;
  if (q.authorId) filter.authorId = q.authorId;

  if (q.search) {
    const pattern = new RegExp(escapeRegExp(q.search), 'i');
    filter.$or = [{ title: pattern }, { content: pattern }];
  }

  const sort =
    q.sort === 'popular'
      ? ({ favoritesCount: -1, publishedAt: -1 } as const)
      : ({ publishedAt: -1 } as const);

  const [docs, total, favouriteIds] = await Promise.all([
    ArticleModel.find(filter)
      .select(LIST_PROJECTION)
      .sort(sort)
      .skip((q.page - 1) * q.limit)
      .limit(q.limit),
    ArticleModel.countDocuments(filter),
    viewerFavourites(viewerId),
  ]);

  const items = docs.map((doc) => ({
    ...doc.toJSON(),
    isFavorite: favouriteIds.has(String(doc._id)),
  }));

  return {
    items,
    meta: {
      total,
      page: q.page,
      pages: Math.ceil(total / q.limit),
    },
  };
}

export async function getByIdOrSlug(idOrSlug: string, viewerId?: string) {
  const isObjectId = /^[0-9a-f]{24}$/i.test(idOrSlug);

  const article = await ArticleModel.findOne(
    isObjectId ? { _id: idOrSlug } : { slug: idOrSlug },
  );

  if (!article) throw ApiError.notFound('Article not found');

  const isOwner = Boolean(viewerId) && String(article.authorId) === viewerId;

  if (article.status !== 'published' && !isOwner) {
    throw ApiError.notFound('Article not found');
  }

  const favouriteIds = await viewerFavourites(viewerId);

  return { ...article.toJSON(), isFavorite: favouriteIds.has(article.id) };
}

export async function listMine(userId: string, q: MyArticlesQuery) {
  const filter: QueryFilter<Article> = { authorId: userId };
  if (q.status) filter.status = q.status;

  const docs = await ArticleModel.find(filter)
    .select(LIST_PROJECTION)
    .sort({ updatedAt: -1 });

  const favouriteIds = await viewerFavourites(userId);

  return docs.map((doc) => ({
    ...doc.toJSON(),
    isFavorite: favouriteIds.has(String(doc._id)),
  }));
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
  const user = await UserModel.findById(userId).select('favorites').lean();
  if (!user) throw ApiError.notFound('User not found');

  const docs = await ArticleModel.find({
    _id: { $in: user.favorites },
    status: 'published',
  })
    .select(LIST_PROJECTION)
    .sort({ publishedAt: -1 });

  // Everything on this page is a favourite by definition.
  return docs.map((doc) => ({ ...doc.toJSON(), isFavorite: true }));
}
