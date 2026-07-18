import { Schema, model, type InferSchemaType } from 'mongoose';

const topicSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

topicSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const { _id, ...rest } = ret;
    return { id: String(_id), ...rest };
  },
});

export type Topic = InferSchemaType<typeof topicSchema>;
export const TopicModel = model('Topic', topicSchema);
