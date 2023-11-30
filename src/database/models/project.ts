import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema()
export class Project {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const projectScheme = SchemaFactory.createForClass(Project);
