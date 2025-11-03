export enum MailType {
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY',
  ACCOUNT_VALIDATION = 'ACCOUNT_VALIDATION',
  RESERVA_CANCELADA_FORZADO = 'RESERVA_CANCELADA_FORZADO',
}

export interface PasswordRecoveryEmail {
  email: string;
  code: string;
}

export interface AccountValidationEmail {
  email: string;
  code: string;
}

export interface ReservaCanceladaForzadoEmail {
  eventoNombre: string;
  fecha: string;
}

export type MailerSendVariables<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  email: string;
  data: T;
};
