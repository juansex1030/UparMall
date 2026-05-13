import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { MailService } from '../utils/mail.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly mailService: MailService) {}

  @Post('new-user')
  async handleNewUser(
    @Body() body: any,
    @Headers('x-webhook-secret') secret: string
  ) {
    const expectedSecret = process.env.WEBHOOK_SECRET || 'uparmall_secret_123';
    
    if (secret !== expectedSecret) {
      console.warn('Unauthorized webhook attempt');
      throw new UnauthorizedException('Invalid secret');
    }

    const email = body?.record?.email || body?.email;

    if (email) {
      await this.mailService.sendWelcomeEmail(email);
    }

    return { success: true };
  }
}
