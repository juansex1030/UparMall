import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from './supabase-auth.guard';
import { User as SupabaseUser } from '@supabase/supabase-js';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SupabaseUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
