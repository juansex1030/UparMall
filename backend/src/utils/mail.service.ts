import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(email: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '¡Bienvenido a UparMall!',
        template: './welcome', // This would require a template file, but I'll use html for simplicity now
        context: {
          email: email,
        },
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3f51b5; margin: 0;">UparMall</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Tu tienda en línea en minutos</p>
            </div>
            <div style="background-color: #f5f7fa; padding: 30px; border-radius: 8px; text-align: center;">
              <h2 style="color: #333; margin-top: 0;">¡Hola! 👋</h2>
              <p style="color: #555; font-size: 1.1rem; line-height: 1.6;">
                Estamos muy emocionados de que hayas decidido unirte a <strong>UparMall</strong>. 
                Ya puedes empezar a configurar tu tienda, añadir productos y digitalizar tu negocio.
              </p>
              <div style="margin-top: 30px;">
                <a href="${process.env.ADMIN_URL || 'https://admin.uparmall.com'}" style="background-color: #3f51b5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">
                  Ir a mi Panel de Control
                </a>
              </div>
            </div>
            <div style="margin-top: 30px; color: #888; font-size: 0.9rem; text-align: center;">
              <p>Si tienes alguna duda, responde a este correo.</p>
              <p>&copy; 2026 UparMall. Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      });
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error(`Error sending welcome email to ${email}:`, error);
    }
  }
}
