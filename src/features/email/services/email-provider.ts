import { Resend } from "resend";
import nodemailer from "nodemailer";

export interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailProvider {
  name: string;
  sendEmail(request: EmailRequest): Promise<boolean>;
}

export class ResendProvider implements EmailProvider {
  name = "Resend";
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(request: EmailRequest): Promise<boolean> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: request.from || process.env.EMAIL_FROM || "LuminaStore <noreply@luminastore.com>",
        to: Array.isArray(request.to) ? request.to : [request.to],
        subject: request.subject,
        html: request.html,
        text: request.text,
      });

      if (error) {
        console.error("Resend error:", error);
        return false;
      }
      return !!data;
    } catch (error) {
      console.error("Failed to send email via Resend:", error);
      return false;
    }
  }
}

export class SmtpProvider implements EmailProvider {
  name = "SMTP";
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(request: EmailRequest): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: request.from || process.env.EMAIL_FROM || "LuminaStore <noreply@luminastore.com>",
        to: request.to,
        subject: request.subject,
        html: request.html,
        text: request.text,
      });
      return !!info.messageId;
    } catch (error) {
      console.error("Failed to send email via SMTP:", error);
      return false;
    }
  }
}

// Basic template helper
export function getOrderConfirmationHtml(orderNumber: string, amount: number) {
  return `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p>Order Number: <strong>${orderNumber}</strong></p>
      <p>Total Amount: <strong>$${amount.toFixed(2)}</strong></p>
    </div>
  `;
}
