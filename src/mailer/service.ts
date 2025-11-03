import logger from '@/logger';
import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';
import {
  MailType,
  PasswordRecoveryEmail,
  AccountValidationEmail,
  ReservaCanceladaForzadoEmail,
  MailerSendVariables,
} from './types';
import config from '@/config';

class Mailer {
  private transporter;

  constructor() {
    // TODO: Setup correctly for production
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: false,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });

    this.transporter
      .verify()
      .then(() => {
        logger.info('SMTP server is ready');
      })
      .catch((e) => {
        logger.error(`Error verifying SMTP server: ${JSON.stringify(e)}`);
        throw e;
      });
  }

  // Now supports generic variables and account validation
  async send<T extends Record<string, unknown> = Record<string, unknown>>(
    type: MailType,
    variables: MailerSendVariables<T>,
  ): Promise<void> {
    try {
      let html = '';
      let subject = '';
      const to = variables.email;
      switch (type) {
        case MailType.PASSWORD_RECOVERY: {
          const { code } = variables.data as unknown as PasswordRecoveryEmail;
          subject = 'Recuperación de contraseña';
          const templatePath = path.join(
            __dirname,
            'emails',
            'password-recovery.html',
          );
          html = fs
            .readFileSync(templatePath, 'utf8')
            .replace('{{code}}', code);
          break;
        }
        case MailType.ACCOUNT_VALIDATION: {
          const { code } = variables.data as unknown as AccountValidationEmail;
          subject = 'Validación de cuenta';
          const templatePath = path.join(
            __dirname,
            'emails',
            'account-validation.html',
          );
          html = fs
            .readFileSync(templatePath, 'utf8')
            .replace('{{code}}', code);
          break;
        }
        case MailType.RESERVA_CANCELADA_FORZADO: {
          const { eventoNombre, fecha } =
            variables.data as unknown as ReservaCanceladaForzadoEmail;
          subject = 'Reserva Cancelada';
          const templatePath = path.join(
            __dirname,
            'emails',
            'reserva-cancelada-forzado.html',
          );
          html = fs
            .readFileSync(templatePath, 'utf8')
            .replace('{{eventoNombre}}', eventoNombre)
            .replace('{{fecha}}', fecha);
          break;
        }
        default:
          throw new Error('Unknown mail type');
      }
      this.transporter
        .sendMail({
          from: config.SMTP_FROM,
          to,
          subject,
          html,
        })
        .then(() => {
          logger.info(`Mail sent to ${to} with subject ${subject}`);
        })
        .catch((e) => {
          logger.error(
            `Error sending mail to ${to} with subject ${subject}: ${JSON.stringify(e)}`,
          );
        });
    } catch (e) {
      logger.error(`Error sending mail: ${JSON.stringify(e)}`);
    }
  }
}

export const mailer = new Mailer();
