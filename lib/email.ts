import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors on Vercel
// The Resend client is only created when actually needed at runtime
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

/**
 * Professional Email Notification Service
 * 
 * Uses Resend API to send Bank of America styled notifications.
 */

export const emailService = {
  /**
   * Send a professional email using Bank of America branding
   */
  async sendEmail({ 
    to, 
    subject, 
    html 
  }: { 
    to: string; 
    subject: string; 
    html: string 
  }) {
    try {
      const resend = getResendClient();
      if (!resend) {
        console.warn('RESEND_API_KEY is missing. Email not sent.');
        return { success: false, error: 'API Key missing' };
      }

      const { data, error } = await resend.emails.send({
        from: `Bank of America <${fromEmail}>`,
        to: [to],
        subject: subject,
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E0E0E0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #012169; padding: 20px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Bank of America</h1>
            </div>
            <div style="padding: 30px; background-color: #FFFFFF;">
              ${html}
            </div>
            <div style="background-color: #F5F5F5; padding: 20px; text-align: center; border-top: 1px solid #E0E0E0;">
              <p style="color: #666666; font-size: 12px; margin-bottom: 5px;">
                © ${new Date().getFullYear()} Bank of America Corporation. All rights reserved.
              </p>
              <p style="color: #999999; font-size: 10px; margin: 0;">
                Bank of America, N.A. Member FDIC. Equal Housing Lender.
              </p>
              <p style="color: #999999; font-size: 10px; margin-top: 10px;">
                SECURITY REMINDER: Bank of America will never ask for your password or passcode in an email.
              </p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.error('Email error:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Fatal email error:', error);
      return { success: false, error };
    }
  },

  /**
   * Notification for Account Creation
   */
  async sendWelcomeEmail(to: string, name: string, onlineId: string, passcode: string) {
    return this.sendEmail({
      to,
      subject: 'Your Bank of America Online Banking Account is Ready',
      html: `
        <h2 style="color: #012169; margin-top: 0;">Welcome to Online Banking</h2>
        <p>Dear ${name},</p>
        <p>Your online banking account has been successfully created. You can now access your accounts, transfer funds, and manage your finances securely.</p>
        <div style="background-color: #F8F9FA; border: 1px solid #E0E0E0; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #333333;"><strong>Your Temporary Credentials:</strong></p>
          <p style="margin: 10px 0 5px 0;">Online ID: <code style="background: #EEEEEE; padding: 2px 4px; border-radius: 4px;">${onlineId}</code></p>
          <p style="margin: 5px 0 0 0;">Passcode: <code style="background: #EEEEEE; padding: 2px 4px; border-radius: 4px;">${passcode}</code></p>
        </div>
        <p>Please log in and change your passcode immediately for security purposes.</p>
        <p style="margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/login" style="background-color: #012169; color: #FFFFFF; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Sign In to Online Banking
          </a>
        </p>
      `
    });
  },

  /**
   * Notification for Transfer Status Change
   */
  async sendTransferStatusEmail(to: string, amount: string, status: 'approved' | 'rejected', notes?: string) {
    const statusColor = status === 'approved' ? '#2E7D32' : '#C62828';
    return this.sendEmail({
      to,
      subject: `Transfer Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <h2 style="color: #012169; margin-top: 0;">Transfer Request Update</h2>
        <p>Your transfer request for <strong>${amount}</strong> has been <strong><span style="color: ${statusColor}; text-transform: uppercase;">${status}</span></strong>.</p>
        ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
        <p>You can view the details of this transaction in your online banking dashboard.</p>
      `
    });
  },

  /**
   * Notification for Balance Update
   */
  async sendBalanceUpdateEmail(to: string, accountType: string, newBalance: string) {
    return this.sendEmail({
      to,
      subject: 'Balance Update for Your Account',
      html: `
        <h2 style="color: #012169; margin-top: 0;">Account Balance Update</h2>
        <p>Your ${accountType} account balance has been updated.</p>
        <p>New Available Balance: <strong>${newBalance}</strong></p>
        <p>Log in to view your full transaction history.</p>
      `
    });
  },

  /**
   * Notification for Withdrawal Status Change
   */
  async sendWithdrawalStatusEmail(to: string, amount: string, status: 'approved' | 'rejected', notes?: string) {
    const statusColor = status === 'approved' ? '#2E7D32' : '#C62828';
    return this.sendEmail({
      to,
      subject: `Withdrawal Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <h2 style="color: #012169; margin-top: 0;">Withdrawal Request Update</h2>
        <p>Your withdrawal request for <strong>${amount}</strong> has been <strong><span style="color: ${statusColor}; text-transform: uppercase;">${status}</span></strong>.</p>
        ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
        <p>You can view the details of this transaction in your online banking dashboard.</p>
      `
    });
  },

  /**
   * Send Login OTP Verification Code
   */
  async sendLoginOTPEmail(to: string, code: string, name: string) {
    return this.sendEmail({
      to,
      subject: 'Your Bank of America Verification Code',
      html: `
        <h2 style="color: #012169; margin-top: 0;">Sign In Verification</h2>
        <p>Dear ${name},</p>
        <p>We received a request to sign in to your Bank of America Online Banking account. Use the verification code below to complete your sign in:</p>
        <div style="background-color: #012169; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0;">
          <p style="color: #FFFFFF; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Verification Code</p>
          <p style="color: #FFFFFF; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${code}</p>
        </div>
        <p style="color: #666666; font-size: 13px;">This code will expire in <strong>10 minutes</strong>.</p>
        <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="color: #92400E; font-size: 12px; margin: 0;">
            <strong>⚠️ Security Notice:</strong> If you did not attempt to sign in, please contact us immediately at 1-800-432-1000.
          </p>
        </div>
        <p style="font-size: 12px; color: #999999;">Do not share this code with anyone. Bank of America employees will never ask for your verification code.</p>
      `
    });
  }
};
