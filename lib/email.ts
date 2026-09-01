import { Resend } from 'resend';

// Resend is the only email provider we keep (SMTP removed as per request)
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend.
 *
 * @param param.from   Optional explicit sender, defaults to EMAIL_FROM env var
 * @param param.to     Recipient email address
 * @param param.subject Email subject
 * @param param.html    HTML body
 */
export async function sendMail({ from, to, subject, html }: {
  from?: string;
  to: string;
  subject: string;
  html: string;
}) {
  const sender = from ?? process.env.EMAIL_FROM;
  if (!sender) throw new Error('EMAIL_FROM not set');
  return resend.emails.send({ from: sender, to, subject, html });
}

