import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP configuration error:', error);
      } else {
        this.logger.log('SMTP server is ready to send emails');
      }
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const template = this.getEmailTemplate('welcome');
      const html = template({
        firstName,
        frontendUrl: this.configService.get('FRONTEND_URL'),
        companyName: this.configService.get('FROM_NAME'),
      });

      await this.transporter.sendMail({
        from: `${this.configService.get('FROM_NAME')} <${this.configService.get('FROM_EMAIL')}>`,
        to: email,
        subject: 'Welcome to our platform!',
        html,
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, firstName: string, otp: string): Promise<void> {
    try {
      const template = this.getEmailTemplate('password-reset');
      const html = template({
        firstName,
        otp,
        frontendUrl: this.configService.get('FRONTEND_URL'),
        companyName: this.configService.get('FROM_NAME'),
      });

      await this.transporter.sendMail({
        from: `${this.configService.get('FROM_NAME')} <${this.configService.get('FROM_EMAIL')}>`,
        to: email,
        subject: 'Password Reset Request',
        html,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }

  async sendEnrollmentConfirmationEmail(
    email: string,
    firstName: string,
    courseName: string,
    sessionDetails: any,
  ): Promise<void> {
    try {
      const template = this.getEmailTemplate('enrollment-confirmation');
      const html = template({
        firstName,
        courseName,
        sessionDetails,
        frontendUrl: this.configService.get('FRONTEND_URL'),
        companyName: this.configService.get('FROM_NAME'),
      });

      await this.transporter.sendMail({
        from: `${this.configService.get('FROM_NAME')} <${this.configService.get('FROM_EMAIL')}>`,
        to: email,
        subject: `Enrollment Confirmed: ${courseName}`,
        html,
      });

      this.logger.log(`Enrollment confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send enrollment confirmation email to ${email}:`, error);
      throw error;
    }
  }

  async sendCertificateEmail(
    email: string,
    firstName: string,
    courseName: string,
    certificateUrl: string,
  ): Promise<void> {
    try {
      const template = this.getEmailTemplate('certificate');
      const html = template({
        firstName,
        courseName,
        certificateUrl,
        frontendUrl: this.configService.get('FRONTEND_URL'),
        companyName: this.configService.get('FROM_NAME'),
      });

      await this.transporter.sendMail({
        from: `${this.configService.get('FROM_NAME')} <${this.configService.get('FROM_EMAIL')}>`,
        to: email,
        subject: `Congratulations! Your ${courseName} Certificate`,
        html,
      });

      this.logger.log(`Certificate email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send certificate email to ${email}:`, error);
      throw error;
    }
  }

  private getEmailTemplate(templateName: string): handlebars.TemplateDelegate {
    try {
      const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      return handlebars.compile(templateSource);
    } catch (error) {
      this.logger.error(`Failed to load email template ${templateName}:`, error);
      // Return a basic template as fallback
      return handlebars.compile('<p>{{message}}</p>');
    }
  }
}