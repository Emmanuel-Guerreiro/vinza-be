import { errors } from '@/error';
import { usersService } from '@/users/service';
import { NextFunction, Request, Response } from 'express';
import { Permissions } from './permissions';

/**
 * Returns an Express middleware that checks if the authenticated user has all required permissions.
 * Must be used after authMiddleware.
 */
export function requirePermissions(requiredPermissions: Permissions[]) {
  return async (req: Request, _: Response, next: NextFunction) => {
    if (!req.user) {
      req.logger.error(
        'User not authenticated. Ensure authMiddleware is used before rbacMiddleware.',
      );
      throw errors.app.general.not_found;
    }

    // Fetch user with role and permissions
    const user = await usersService.findOne(req.user.sub);
    if (!user) {
      req.logger.error('User not found in database.');
      throw errors.app.general.not_found;
    }

    // Collect all permission names for the user's role
    const userPermissions: string[] =
      user.role?.permissionsToRoles
        ?.map((ptr) => ptr.permission?.key)
        .filter(Boolean) || [];

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      req.logger.error(
        `User lacks required permissions: ${requiredPermissions
          .filter((perm) => !userPermissions.includes(perm))
          .join(', ')}`,
      );
      throw errors.app.general.not_found;
    }

    next();
  };
}
