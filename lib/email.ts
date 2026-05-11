/**
 * Email service using Resend API
 * Handles verification emails, claim notifications, and outreach
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://finddetailersnow.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'FindDetailersNow <hello@finddetailersnow.com>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: from || FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend API error: ${res.status} ${error}`);
  }

  return res.json();
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  businessName: string
) {
  const verifyUrl = `${BASE_URL}/api/verify?token=${token}`;
  
  return sendEmail({
    to: email,
    subject: `Verify your claim for ${businessName} on FindDetailersNow`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#1e3a5f;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">🔧 FindDetailersNow</h1>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="margin:0 0 16px;color:#1e3a5f;font-size:20px;">Verify Your Business Claim</h2>
      <p style="color:#374151;line-height:1.6;margin:0 0 16px;">
        You requested to claim <strong>${businessName}</strong> on FindDetailersNow.com.
      </p>
      <p style="color:#374151;line-height:1.6;margin:0 0 24px;">
        Click the button below to verify your email and activate your listing:
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${verifyUrl}" 
           style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
          ✅ Verify My Business
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px;line-height:1.5;margin:24px 0 0;">
        This link expires in 48 hours. If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="color:#6b7280;font-size:13px;line-height:1.5;margin:0;">
        <strong>What happens next?</strong><br>
        Once verified, you'll get a free dashboard to manage your listing. 
        You can upgrade to Pro ($29/mo) for priority placement or Featured ($79/mo) 
        for homepage spotlight — but the basic listing is always free.
      </p>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        FindDetailersNow.com — The #1 Auto Detailing Directory
      </p>
    </div>
  </div>
</body>
</html>
    `,
  });
}

export async function sendClaimApprovedEmail(
  email: string,
  businessName: string
) {
  return sendEmail({
    to: email,
    subject: `🎉 ${businessName} is now verified on FindDetailersNow!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#059669;padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">🎉 You're Verified!</h1>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="margin:0 0 16px;color:#1e3a5f;font-size:20px;">Welcome, ${businessName}!</h2>
      <p style="color:#374151;line-height:1.6;margin:0 0 16px;">
        Your business listing on FindDetailersNow.com is now <strong>verified and live</strong>. 
        Customers searching for auto detailing in your area can now find you with a verified badge.
      </p>
      <h3 style="color:#1e3a5f;font-size:16px;margin:24px 0 12px;">What you get for free:</h3>
      <ul style="color:#374151;line-height:1.8;padding-left:20px;margin:0 0 24px;">
        <li>✅ Verified business badge</li>
        <li>📍 Listing in your city's detailing directory</li>
        <li>📊 Basic analytics on your listing views</li>
      </ul>
      <h3 style="color:#1e3a5f;font-size:16px;margin:24px 0 12px;">Want more customers?</h3>
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:20px;margin:0 0 16px;">
        <p style="margin:0 0 8px;font-weight:600;color:#0369a1;">⭐ Pro Plan — $29/mo</p>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;">
          Priority placement in search, customer reviews, photo gallery, and click-to-call.
        </p>
      </div>
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 8px;font-weight:600;color:#92400e;">🏆 Featured Plan — $79/mo</p>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;">
          Everything in Pro + homepage spotlight, featured badge, and top-of-city placement.
        </p>
      </div>
      <div style="text-align:center;">
        <a href="${BASE_URL}/dashboard" 
           style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
          View Your Dashboard →
        </a>
      </div>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        FindDetailersNow.com — The #1 Auto Detailing Directory
      </p>
    </div>
  </div>
</body>
</html>
    `,
  });
}
