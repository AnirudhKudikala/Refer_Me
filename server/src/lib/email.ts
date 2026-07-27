import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (env.smtpHost && env.smtpUser && env.smtpPass) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });
  } else {
    // Dev fallback: log emails to console
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    } as nodemailer.TransportOptions);
  }
  return transporter;
}

export async function sendInterestNotification(seekerEmail: string) {
  const siteUrl = env.clientUrl;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #10b981; margin-bottom: 16px;">Refer Me</h2>
      <p style="color: #334155; line-height: 1.6;">
        Someone expressed interest in your profile.
        <a href="${siteUrl}/seeker" style="color: #10b981; font-weight: 600;">Open Refer Me</a>
        to see more details.
      </p>
    </div>
  `;

  const info = await getTransporter().sendMail({
    from: env.emailFrom,
    to: seekerEmail,
    subject: "Someone expressed interest in your profile — Refer Me",
    html,
    text: `Someone expressed interest in your profile. Open Refer Me (${siteUrl}/seeker) to see more details.`,
  });

  if (!env.smtpHost) {
    console.log("\n📧 [Refer Me] Interest notification email");
    console.log(`   To: ${seekerEmail}`);
    console.log(`   Link: ${siteUrl}/seeker`);
    if ("message" in info && Buffer.isBuffer(info.message)) {
      console.log(info.message.toString());
    }
  }
}
