import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Role extends Document {
  @Prop({ required: true })
  name: string; // e.g. Admin, Manager, Developer

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Types.ObjectId; // multi-tenant support

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }], default: [] })
  permissions: Types.ObjectId[];

  @Prop({ default: false })
  isSystemRole: boolean; // true for default roles (Admin, Member)
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// 🔥 Indexes
RoleSchema.index({ organization: 1, name: 1 }, { unique: true });
