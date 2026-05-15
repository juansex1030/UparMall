import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    if (request.body) {
      this.sanitizeObject(request.body);
    }

    return next.handle();
  }

  private sanitizeObject(obj: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Basic XSS protection: strip HTML tags
        obj[key] = obj[key].replace(/<[^>]*>?/gm, '').trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeObject(obj[key]);
      }
    }
  }
}
