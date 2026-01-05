import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

export async function getResendClient() {
  const { apiKey } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: connectionSettings.settings.from_email
  };
}

export async function sendVerificationEmail(email: string, token: string, baseUrl: string) {
  console.log(`Attempting to send verification email to: ${email}`);
  
  try {
    const { client, fromEmail } = await getResendClient();
    
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Using from email: ${fromEmail}`);
    
    const result = await client.emails.send({
      from: fromEmail || 'noreply@47dapunjab.com',
      to: email,
      subject: 'Verify your email - 47DaPunjab',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #5D4037; font-size: 28px; margin-bottom: 20px;">Welcome to 47DaPunjab</h1>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for registering! Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #D4A574; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${verificationUrl}" style="color: #D4A574;">${verificationUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
          <p style="color: #999; font-size: 12px;">
            47DaPunjab - Reconnecting Roots Across Borders
          </p>
        </div>
      `,
    });
    
    console.log(`Verification email sent successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error);
    throw error;
  }
}
