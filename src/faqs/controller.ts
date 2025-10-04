import { NextFunction, Request, Response } from 'express';
import {
  createFaqRecipientSchema,
  createFaqSchema,
  findAllFaqsSchema,
  updateFaqRecipientSchema,
  updateFaqSchema,
} from './schema';
import { faqService } from './service';

export class FaqController {
  constructor() {
    this.findAllRecipients = this.findAllRecipients.bind(this);
    this.findRecipientById = this.findRecipientById.bind(this);
    this.createRecipient = this.createRecipient.bind(this);
    this.updateRecipient = this.updateRecipient.bind(this);
    this.deleteRecipient = this.deleteRecipient.bind(this);
    this.findAllFaqs = this.findAllFaqs.bind(this);
    this.findFaqById = this.findFaqById.bind(this);
    this.findFaqsByRecipient = this.findFaqsByRecipient.bind(this);
    this.createFaq = this.createFaq.bind(this);
    this.updateFaq = this.updateFaq.bind(this);
    this.deleteFaq = this.deleteFaq.bind(this);
  }

  // FaqRecipient endpoints
  async findAllRecipients(_req: Request, res: Response, next: NextFunction) {
    faqService
      .findAllRecipients()
      .then((recipients) => res.json(recipients))
      .catch((err) => next(err));
  }

  async findRecipientById(req: Request, res: Response, next: NextFunction) {
    faqService
      .findRecipientById(+req.params.id)
      .then((recipient) => res.json(recipient))
      .catch((err) => next(err));
  }

  async createRecipient(req: Request, res: Response, next: NextFunction) {
    createFaqRecipientSchema.parseAsync(req.body).then((data) =>
      faqService
        .createRecipient(data)
        .then((recipient) => res.status(201).json(recipient))
        .catch((err) => next(err)),
    );
  }

  async updateRecipient(req: Request, res: Response, next: NextFunction) {
    updateFaqRecipientSchema
      .parseAsync(req.body)
      .then((data) =>
        faqService
          .updateRecipient(+req.params.id, data)
          .then((recipient) => res.json(recipient))
          .catch((err) => next(err)),
      )
      .catch((err) => next(err));
  }

  async deleteRecipient(req: Request, res: Response, next: NextFunction) {
    faqService
      .deleteRecipient(+req.params.id)
      .then((result) => res.json(result))
      .catch((err) => next(err));
  }

  // Faq endpoints
  async findAllFaqs(req: Request, res: Response, next: NextFunction) {
    findAllFaqsSchema
      .parseAsync(req.query)
      .then((data) =>
        faqService
          .findAllFaqs(data)
          .then((faqs) => res.json(faqs))
          .catch((err) => next(err)),
      )
      .catch((err) => next(err));
  }

  async findFaqById(req: Request, res: Response, next: NextFunction) {
    faqService
      .findFaqById(+req.params.id)
      .then((faq) => res.json(faq))
      .catch((err) => next(err));
  }

  async findFaqsByRecipient(req: Request, res: Response, next: NextFunction) {
    faqService
      .findFaqsByRecipient(+req.params.recipientId)
      .then((faqs) => res.json(faqs))
      .catch((err) => next(err));
  }

  async createFaq(req: Request, res: Response, next: NextFunction) {
    createFaqSchema.parseAsync(req.body).then((data) =>
      faqService
        .createFaq(data)
        .then((faq) => res.status(201).json(faq))
        .catch((err) => next(err)),
    );
  }

  async updateFaq(req: Request, res: Response, next: NextFunction) {
    updateFaqSchema
      .parseAsync(req.body)
      .then((data) =>
        faqService
          .updateFaq(+req.params.id, data)
          .then((faq) => res.json(faq))
          .catch((err) => next(err)),
      )
      .catch((err) => next(err));
  }

  async deleteFaq(req: Request, res: Response, next: NextFunction) {
    faqService
      .deleteFaq(+req.params.id)
      .then((result) => res.json(result))
      .catch((err) => next(err));
  }
}
