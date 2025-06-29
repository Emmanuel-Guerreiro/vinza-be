import { NextFunction, Request, Response } from 'express';

// context/request-context.ts
import { createNamespace, getNamespace } from 'cls-hooked';

const NAMESPACE_NAME = 'app.context';

type ctx = {
  user: number;
  traceId: string;
};

export const context =
  getNamespace<ctx>(NAMESPACE_NAME) || createNamespace<ctx>(NAMESPACE_NAME);

export function setContext(key: keyof ctx, value: ctx[keyof ctx]) {
  context.set(key, value);
}

export function getContext(key: keyof ctx) {
  return context.get(key);
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
    next();
  });
}
