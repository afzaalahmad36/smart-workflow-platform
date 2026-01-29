import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Project extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: null })
  description: string;

  // Project owner (creator)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  // Team members (Jira-style)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  // Project status
  @Prop({ enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  status: ProjectStatus;

  // Project key like Jira (e.g. PROJ, WF, TASK)
  @Prop({ required: true, uppercase: true, trim: true })
  key: string;

  // Optional icon / cover
  @Prop({ default: null })
  iconUrl: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

/* =======================
   🔥 PROFESSIONAL INDEXES
   ======================= */

// Unique project key (like Jira project key)
ProjectSchema.index({ key: 1 }, { unique: true });

// Fast lookup by owner (projects created by user)
ProjectSchema.index({ owner: 1 });

// Team-based queries (projects where user is member)
ProjectSchema.index({ members: 1 });

// Status filtering (active/archived projects)
ProjectSchema.index({ status: 1 });

// Sorting & listing (recent projects)
ProjectSchema.index({ createdAt: -1 });
