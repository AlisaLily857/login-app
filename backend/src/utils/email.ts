import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (
  to: string,
  code: string,
  type: 'verification' | 'password-reset' = 'verification'
): Promise<void> => {
  const subject = type === 'verification' 
    ? '邮箱验证码 - Login App'
    : '密码重置 - Login App';

  const html = type === 'verification'
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Login App</h2>
        <p>您好，</p>
        <p>您的验证码是：</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">
          ${code}
        </div>
        <p>此验证码将在 10 分钟后过期。</p>
        <p>如果您没有请求此验证码，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">Login App 团队</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Login App</h2>
        <p>您好，</p>
        <p>您请求了密码重置。您的验证码是：</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">
          ${code}
        </div>
        <p>此验证码将在 10 分钟后过期。</p>
        <p>如果您没有请求密码重置，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">Login App 团队</p>
      </div>
    `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@loginapp.com',
    to,
    subject,
    html,
  });
};

export const sendLoginNotification = async (
  to: string,
  device: string,
  location: string,
  time: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">Login App</h2>
      <p>您好，</p>
      <p>我们检测到您的账号在新设备上登录：</p>
      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
        <p><strong>设备：</strong>${device}</p>
        <p><strong>地点：</strong>${location}</p>
        <p><strong>时间：</strong>${time}</p>
      </div>
      <p>如果这不是您本人的操作，请立即修改密码。</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">Login App 安全团队</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@loginapp.com',
    to,
    subject: '新设备登录提醒 - Login App',
    html,
  });
};
