import { auditEmitter } from '@/audit/event';
import { sequelize } from '@/db';
import { Op, FindOptions } from 'sequelize';
import { Faq, FaqRecipient } from './model';
import {
  CreateFaqDto,
  CreateFaqRecipientDto,
  FindAllFaqsParams,
  UpdateFaqDto,
  UpdateFaqRecipientDto,
} from './types';
import {
  generateOrderConditions,
  generatePaginationParams,
} from '@/pagination';

export class FaqService {
  // FaqRecipient methods
  async findAllRecipients() {
    return FaqRecipient.findAll({
      where: { deleted_at: { [Op.is]: null } },
      order: [['created_at', 'ASC']],
    });
  }

  async findRecipientById(id: number) {
    return FaqRecipient.findOne({
      where: { id, deleted_at: { [Op.is]: null } },
    });
  }

  async createRecipient(data: CreateFaqRecipientDto) {
    const transaction = await sequelize.transaction();
    try {
      const entity = await FaqRecipient.create(data, { transaction });
      await transaction.commit();

      auditEmitter.emitEntry({
        valor: entity.toJSON(),
        tipoEvento: 'faq-recipient:create',
      });

      return entity;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateRecipient(id: number, data: UpdateFaqRecipientDto) {
    const transaction = await sequelize.transaction();
    try {
      const entity = await FaqRecipient.findOne({
        where: { id, deleted_at: { [Op.is]: null } },
        transaction,
      });

      if (!entity) {
        throw new Error('FaqRecipient not found');
      }

      await entity.update(data, { transaction });
      await transaction.commit();

      auditEmitter.emitEntry({
        valor: entity.toJSON(),
        tipoEvento: 'faq-recipient:update',
      });

      return entity;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteRecipient(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const entity = await FaqRecipient.findOne({
        where: { id, deleted_at: { [Op.is]: null } },
        transaction,
      });

      if (!entity) {
        throw new Error('FaqRecipient not found');
      }

      await entity.destroy({ transaction });
      await transaction.commit();

      auditEmitter.emitEntry({
        valor: entity.toJSON(),
        tipoEvento: 'faq-recipient:delete',
      });

      return { message: 'FaqRecipient deleted successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Faq methods
  async findAllFaqs(params: FindAllFaqsParams) {
    const order = generateOrderConditions(params);
    const { limit, offset } = generatePaginationParams(params);

    const queryOptions = {
      where: { deleted_at: { [Op.is]: null } },
      order,
      limit,
      offset,
      include: [
        {
          model: FaqRecipient,
          as: 'recipient',
          where: params.recipient ? { name: params.recipient } : undefined,
          required: !!params.recipient,
        },
      ],
    };

    const [meta, items] = await Promise.all([
      this.getCountAndMetadata(queryOptions, params.page, limit),
      Faq.findAll(queryOptions),
    ]);

    return {
      items,
      meta,
    };
  }

  async findFaqById(id: number) {
    return Faq.findOne({
      where: { id, deleted_at: { [Op.is]: null } },
      include: [{ model: FaqRecipient, as: 'recipient' }],
    });
  }

  async findFaqsByRecipient(recipientId: number) {
    return Faq.findAll({
      where: { recipient_id: recipientId, deleted_at: { [Op.is]: null } },
      include: [{ model: FaqRecipient, as: 'recipient' }],
      order: [['created_at', 'ASC']],
    });
  }

  async createFaq(data: CreateFaqDto) {
    const transaction = await sequelize.transaction();
    try {
      // Verify recipient exists
      const recipient = await FaqRecipient.findOne({
        where: { id: data.recipient_id, deleted_at: { [Op.is]: null } },
        transaction,
      });

      if (!recipient) {
        throw new Error('FaqRecipient not found');
      }

      const entity = await Faq.create(data, { transaction });
      await transaction.commit();

      auditEmitter.emitEntry({
        valor: entity.toJSON(),
        tipoEvento: 'faq:create',
      });

      return entity;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateFaq(id: number, data: UpdateFaqDto) {
    const transaction = await sequelize.transaction();
    try {
      const entity = await Faq.findOne({
        where: { id, deleted_at: { [Op.is]: null } },
        transaction,
      });

      if (!entity) {
        throw new Error('Faq not found');
      }

      // If updating recipient_id, verify it exists
      if (data.recipient_id) {
        const recipient = await FaqRecipient.findOne({
          where: { id: data.recipient_id, deleted_at: { [Op.is]: null } },
          transaction,
        });

        if (!recipient) {
          throw new Error('FaqRecipient not found');
        }
      }

      await entity.update(data, { transaction });
      await transaction.commit();

      auditEmitter.emitEntry({
        valor: entity.toJSON(),
        tipoEvento: 'faq:update',
      });

      return entity;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteFaq(id: number) {
    const transaction = await sequelize.transaction();
    try {
      const entity = await Faq.findOne({
        where: { id, deleted_at: { [Op.is]: null } },
        transaction,
      });

      if (!entity) {
        throw new Error('Faq not found');
      }

      await entity.destroy({ transaction });
      await transaction.commit();

      auditEmitter.emitEntry({
        valor: entity.toJSON(),
        tipoEvento: 'faq:delete',
      });

      return { message: 'Faq deleted successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get total count of items and generate complete pagination metadata
   */
  private async getCountAndMetadata(
    queryOptions: FindOptions,
    page: number,
    limit: number,
  ) {
    const totalItems = await Faq.count(queryOptions);

    return {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page || 1,
      itemsPerPage: limit,
    };
  }
}

export const faqService = new FaqService();
