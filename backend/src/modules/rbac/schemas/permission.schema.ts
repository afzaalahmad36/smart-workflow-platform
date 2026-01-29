import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum PermissionResource {
  ORGANIZATION = 'organization',
  PROJECT = 'project',
  TASK = 'task',
  USER = 'user',
  COMMENT = 'comment',
  ROLE = 'role',
}

@Schema({ timestamps: true, versionKey: false })
export class Permission extends Document {
  @Prop({ required: true })
  name: string; // e.g. "task.create"

  @Prop({ enum: PermissionAction, required: true })
  action: PermissionAction;

  @Prop({ enum: PermissionResource, required: true })
  resource: PermissionResource;

  @Prop({ default: '' })
  description?: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// 🔥 Unique permission
PermissionSchema.index({ action: 1, resource: 1 }, { unique: true });
PermissionSchema.index({ name: 1 }, { unique: true });
