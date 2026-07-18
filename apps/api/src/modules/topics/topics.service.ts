import { ApiError } from '#utils/ApiError';
import { ArticleModel } from '#modules/articles/article.model';
import { TopicModel } from '#modules/topics/topic.model';
import slugify from '@sindresorhus/slugify';

export async function listTopics() {
  return TopicModel.find().sort({ name: 1 });
}

export async function createTopic(name: string) {
  const slug = slugify(name);
  const existing = await TopicModel.findOne({ slug });
  if (existing) {
    throw ApiError.conflict('Topic already exists', { topic: existing.toJSON() });
  }
  return TopicModel.create({ name, slug });
}

export async function deleteTopic(id: string) {
  const inUse = await ArticleModel.exists({ topicIds: id });
  if (inUse) {
    throw ApiError.conflict('Topic is referenced by existing articles');
  }
  const deleted = await TopicModel.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound('Topic not found');
}
