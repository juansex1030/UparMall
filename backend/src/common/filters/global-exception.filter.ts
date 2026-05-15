import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const isProduction = process.env['NODE_ENV'] === 'production';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Ha ocurrido un error interno en el servidor' };

    // In production, we never want to leak the actual exception details if it's not a known HttpException
    if (isProduction && !(exception instanceof HttpException)) {
      console.error('CRITICAL INTERNAL ERROR:', exception);
      return response.status(status).json({
        statusCode: status,
        message: 'Lo sentimos, algo salió mal. Por favor intenta más tarde.',
        error: 'Internal Server Error'
      });
    }

    response.status(status).json(message);
  }
}
