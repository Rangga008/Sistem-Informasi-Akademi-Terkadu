import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendNewProjectNotification(
    followerEmail: string,
    followerName: string,
    uploaderName: string,
    projectTitle: string,
    projectDescription: string,
    projectUrl: string,
  ) {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM', 'noreply@akademi.com'),
        to: followerEmail,
        subject: `${uploaderName} telah mengupload project baru!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Halo ${followerName}!</h2>
            <p><strong>${uploaderName}</strong> yang kamu follow telah mengupload project baru:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${projectTitle}</h3>
              <p style="color: #666;">${projectDescription}</p>
            </div>
            
            <a href="${projectUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              Lihat Project
            </a>
            
            <p style="margin-top: 30px; color: #999; font-size: 12px;">
              Email ini dikirim otomatis karena kamu mengikuti ${uploaderName}. 
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${followerEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${followerEmail}:`, error);
    }
  }

  async sendProjectLikeNotification(
    ownerEmail: string,
    ownerName: string,
    likerName: string,
    projectTitle: string,
    projectUrl: string,
  ) {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM', 'noreply@akademi.com'),
        to: ownerEmail,
        subject: `${likerName} menyukai project kamu!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Halo ${ownerName}!</h2>
            <p><strong>${likerName}</strong> telah menyukai project kamu:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${projectTitle}</h3>
            </div>
            
            <a href="${projectUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              Lihat Project
            </a>
            
            <p style="margin-top: 30px; color: #999; font-size: 12px;">
              Email notifikasi dari Sistem Informasi Akademi
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Like notification sent to ${ownerEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send like notification to ${ownerEmail}:`,
        error,
      );
    }
  }
}
