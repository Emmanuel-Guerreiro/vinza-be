import { NextFunction, Request, Response } from 'express';

// context/request-context.ts
import { createNamespace, getNamespace } from 'cls-hooked';

const NAMESPACE_NAME = 'app.context';

type ctx = {
  user: number;
  traceId: string;
  isRestricted: boolean;
};

export const context =
  getNamespace<ctx>(NAMESPACE_NAME) || createNamespace<ctx>(NAMESPACE_NAME);

export function setContext(key: keyof ctx, value: ctx[keyof ctx]) {
  context.set(key, value);
}

export function getContext(key: keyof ctx) {
  return context.get(key);
}

export function isRestrictedContext(): boolean {
  return Boolean(getContext('isRestricted'));
}

export function isNormalContext(): boolean {
  return !isRestrictedContext();
}

export function contextMiddleware(
  req: Request,
  _: Response,
  next: NextFunction,
) {
  context.run(() => {
    if (req.trace_id) {
      setContext('traceId', req.trace_id);
    }

    // Detectar si la llamada viene de una ruta restricted
    const isRestricted = req.path.includes('/restricted');
    setContext('isRestricted', isRestricted);

    next();
  });
}
