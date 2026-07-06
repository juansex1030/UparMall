import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class MaintenanceInterceptor implements NestInterceptor {
  constructor(private readonly supabaseService: SupabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const url = request.url;

    // Excluir endpoints maestros para poder desactivar el mantenimiento
    if (url.includes('/master/')) {
      return next.handle();
    }

    return from(this.checkMaintenance()).pipe(
      switchMap((isMaintenance) => {
        if (isMaintenance) {
          throw new HttpException(
            'La plataforma se encuentra en mantenimiento. Volveremos pronto.',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        return next.handle();
      }),
    );
  }

  private async checkMaintenance(): Promise<boolean> {
    try {
      const { data } = (await this.supabaseService.adminClient
        .from('PlatformSettings')
        .select('maintenance_mode')
        .eq('id', 1)
        .single()) as { data: { maintenance_mode?: boolean } | null };
      return data?.maintenance_mode || false;
    } catch {
      return false;
    }
  }
}
