import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.body) {
      this.sanitizeObject(request.body);
    }

    return next.handle();
  }

  private sanitizeObject(obj: unknown) {
    if (typeof obj !== 'object' || obj === null) return;

    const objectRecord = obj as Record<string, unknown>;
    for (const key in objectRecord) {
      if (typeof objectRecord[key] === 'string') {
        // Basic XSS protection: strip HTML tags
        objectRecord[key] = objectRecord[key].replace(/<[^>]*>?/gm, '').trim();
      } else if (
        typeof objectRecord[key] === 'object' &&
        objectRecord[key] !== null
      ) {
        this.sanitizeObject(objectRecord[key]);
      }
    }
  }
}
