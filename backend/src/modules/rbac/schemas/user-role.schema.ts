import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class UserRole extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Types.ObjectId;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);

// 🔥 Indexes
UserRoleSchema.index({ user: 1, organization: 1 });
UserRoleSchema.index({ role: 1 });
UserRoleSchema.index({ user: 1, role: 1 }, { unique: true });
