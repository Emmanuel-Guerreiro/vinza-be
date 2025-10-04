import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { FaqRecipientsEnum } from './enums';

export interface FaqRecipientAttributes {
  id?: number;
  name: FaqRecipientsEnum;
  label: string;
  created_at: Date;
  deleted_at?: Date | null;
  updated_at: Date;
}

export interface FaqRecipientCreationAttributes {
  name: FaqRecipientsEnum;
  label: string;
}

export interface FaqAttributes {
  id?: number;
  question: string;
  answer: string;
  recipient_id: number;
  created_at: Date;
  deleted_at?: Date | null;
  updated_at: Date;
}

export interface FaqCreationAttributes {
  question: string;
  answer: string;
  recipient_id: number;
}

@Table({
  tableName: 'faq_recipients',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
  updatedAt: 'updated_at',
})
export class FaqRecipient extends Model<
  FaqRecipientAttributes,
  FaqRecipientCreationAttributes
> {
  @Column({
    type: DataType.ENUM(...Object.values(FaqRecipientsEnum)),
    allowNull: false,
  })
  name!: FaqRecipientsEnum;

  @Column({ type: DataType.STRING, allowNull: false })
  label!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  created_at!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  deleted_at?: Date | null;

  @Column({ type: DataType.DATE, allowNull: false })
  updated_at!: Date;
}

@Table({
  tableName: 'faqs',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  deletedAt: 'deleted_at',
  updatedAt: 'updated_at',
})
export class Faq extends Model<FaqAttributes, FaqCreationAttributes> {
  @Column({ type: DataType.TEXT, allowNull: false })
  question!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  answer!: string;

  @ForeignKey(() => FaqRecipient)
  @Column({ type: DataType.INTEGER, allowNull: false })
  recipient_id!: number;

  @BelongsTo(() => FaqRecipient)
  recipient!: FaqRecipient;

  @Column({ type: DataType.DATE, allowNull: false })
  created_at!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  deleted_at?: Date | null;

  @Column({ type: DataType.DATE, allowNull: false })
  updated_at!: Date;
}
