import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
  },
  { timestamps: true },
);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: Record<string, unknown>) => {
    const { _id, passwordHash: _hidden, ...rest } = ret;
    return { id: String(_id), ...rest };
  },
});

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
