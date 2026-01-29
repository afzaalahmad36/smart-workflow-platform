import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole, UserStatus } from '../../../cors/enums/user.enum';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User extends Document {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }], default: [] })
  projects: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Organization' }], default: [] })
  organizations: Types.ObjectId[];

  @Prop({ default: null })
  avatarUrl: string;

  @Prop({ default: null })
  jobTitle: string;

  @Prop({ default: null })
  lastLoginAt: Date;

  @Prop({ default: false })
  isEmailVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

/* =======================
   🔥 PROFESSIONAL INDEXES
   ======================= */

// Unique email (fast login & lookup)
UserSchema.index({ email: 1 }, { unique: true });

// Role-based queries (RBAC filtering)
UserSchema.index({ role: 1 });

// Status-based queries (active/inactive users)
UserSchema.index({ status: 1 });

// Project-based queries (Jira-style team lookup)
UserSchema.index({ projects: 1 });

// Sorting & analytics queries (recent users)
UserSchema.index({ createdAt: -1 });
