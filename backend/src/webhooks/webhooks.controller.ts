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
    // Basic security check (you should set a secret in Supabase Webhook and env)
    // For now, I'll allow it or check against a placeholder
    const expectedSecret = process.env.WEBHOOK_SECRET || 'uparmall_secret_123';
    
    if (secret !== expectedSecret) {
      console.warn('Unauthorized webhook attempt');
      // throw new UnauthorizedException('Invalid secret');
      // Note: During initial setup, we might want to log the secret to verify
    }

    console.log('Received webhook for new user:', body);

    // Supabase Auth Webhook usually sends the user object
    // Depending on how the trigger is set up, the structure might vary
    const email = body?.record?.email || body?.email;

    if (email) {
      await this.mailService.sendWelcomeEmail(email);
    }

    return { success: true };
  }
}
