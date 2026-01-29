import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  BLOCKED = 'blocked',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Task extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: null })
  description: string;

  // Relation: Project (Jira-style)
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  // Task creator
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  // Assigned user
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignee: Types.ObjectId;

  // Task status (workflow)
  @Prop({ enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  // Priority
  @Prop({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  // Due date
  @Prop({ default: null })
  dueDate: Date;

  // Tags (labels like Jira)
  @Prop({ type: [String], default: [] })
  tags: string[];

  // Order in board (kanban sorting)
  @Prop({ default: 0 })
  order: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

/* =======================
   🔥 PROFESSIONAL INDEXES
   ======================= */

// Project-based task listing (most common query)
TaskSchema.index({ project: 1 });

// Status-based workflow queries (kanban board)
TaskSchema.index({ status: 1 });

// Assignee-based queries (my tasks)
TaskSchema.index({ assignee: 1 });

// Priority filtering
TaskSchema.index({ priority: 1 });

// Due date reminders & sorting
TaskSchema.index({ dueDate: 1 });

// Compound index: project + status (kanban board optimization)
TaskSchema.index({ project: 1, status: 1 });

// Sorting & analytics (recent tasks)
TaskSchema.index({ createdAt: -1 });
