const nodemailer = require('nodemailer');

function createTransporter() {
  const port = Number(process.env.SMTP_PORT) || 587;
  const isSecure = port === 465; // true SSL only for port 465

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: isSecure,

    // For port 587 (STARTTLS): requireTLS forces upgrade, tls options handle cert issues
    requireTLS: !isSecure,
    tls: {
      rejectUnauthorized: false, // needed on some hosting environments
      minVersion: 'TLSv1.2',
    },

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
}

/**
 * Verify SMTP connection — call on startup to catch config issues early.
 * Returns { ok: true } or { ok: false, error: string }
 */
async function verifyTransporter() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('[mailer] SMTP connection verified ✓');
    return { ok: true };
  } catch (err) {
    console.error('[mailer] SMTP verification failed:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { createTransporter, verifyTransporter };
