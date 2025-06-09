import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);