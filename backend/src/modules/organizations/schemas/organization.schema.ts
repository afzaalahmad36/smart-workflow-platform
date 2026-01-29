import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Organization extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  // Unique slug (used in URLs like: app.com/org/my-company)
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  // Organization owner
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  // Members of organization
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  // Organization status
  @Prop({ enum: OrganizationStatus, default: OrganizationStatus.ACTIVE })
  status: OrganizationStatus;

  // Branding (SaaS feature)
  @Prop({ default: null })
  logoUrl: string;

  @Prop({ default: null })
  website: string;

  // Plan / subscription (future-ready)
  @Prop({ default: 'free' })
  plan: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

/* =======================
   🔥 PROFESSIONAL INDEXES
   ======================= */

// Unique slug (fast org lookup by URL)
OrganizationSchema.index({ slug: 1 }, { unique: true });

// Owner-based queries (orgs created by user)
OrganizationSchema.index({ owner: 1 });

// Member-based queries (orgs where user belongs)
OrganizationSchema.index({ members: 1 });

// Status filtering (active/suspended orgs)
OrganizationSchema.index({ status: 1 });

// Sorting & analytics (recent organizations)
OrganizationSchema.index({ createdAt: -1 });
