const pool = require('../config/db');
const { createTransporter } = require('../config/mailer');

// Ensure the subscribers table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(180) UNIQUE NOT NULL,
      subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    );
  `);
}
ensureTable().catch((e) => console.error('[subscribers] table init failed:', e.message));

// POST /api/subscribers — public, store email
async function subscribe(req, res) {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const result = await pool.query(
      `INSERT INTO subscribers (email, is_active)
       VALUES ($1, TRUE)
       ON CONFLICT (email)
       DO UPDATE SET is_active = TRUE, subscribed_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [email.toLowerCase().trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'You have been subscribed successfully.',
      data: { email: result.rows[0].email },
    });
  } catch (error) {
    console.error('[subscribe]', error.message);
    return res.status(500).json({ success: false, message: 'Subscription failed. Please try again.' });
  }
}

// DELETE /api/subscribers/unsubscribe/:email — unsubscribe
async function unsubscribe(req, res) {
  try {
    const { email } = req.params;
    await pool.query(
      `UPDATE subscribers SET is_active = FALSE WHERE email = $1`,
      [decodeURIComponent(email).toLowerCase().trim()]
    );
    return res.status(200).json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unsubscribe failed.' });
  }
}

// GET /api/subscribers/admin/all — admin only
async function getAllSubscribers(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, email, subscribed_at, is_active
       FROM subscribers
       ORDER BY subscribed_at DESC`
    );
    return res.status(200).json({ success: true, data: result.rows, total: result.rows.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subscribers.' });
  }
}

// DELETE /api/subscribers/admin/:id — admin delete
async function deleteSubscriber(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM subscribers WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subscriber not found.' });
    }
    return res.status(200).json({ success: true, message: 'Subscriber deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Delete failed.' });
  }
}

// GET /api/subscribers/admin/test-email — admin only, tests SMTP connection
async function testEmail(req, res) {
  try {
    const transporter = createTransporter();

    // Verify connection first
    await transporter.verify();
    console.log('[test-email] SMTP connection verified');

    // Send a test email to the admin
    const info = await transporter.sendMail({
      from: `Faiz Alam Faizi <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER,
      subject: 'SMTP Test — Subscriber Notification System',
      html: `<p>SMTP is working correctly. Subscriber notifications will be sent when posts are published.</p>`,
      text: 'SMTP is working correctly. Subscriber notifications will be sent when posts are published.',
    });

    console.log('[test-email] Test email sent:', info.messageId);
    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully.',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('[test-email] Failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'SMTP test failed.',
      error: error.message,
      hint: 'Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your .env file. For Gmail, use an App Password (not your account password).',
    });
  }
}

/**
 * Called internally when a new post is published.
 * Sends email notifications to all active subscribers.
 *
 * IMPORTANT: Only call this when a post transitions TO published status,
 * not on every update of an already-published post.
 */
async function notifySubscribers(post) {
  console.log(`[notifySubscribers] Starting for post: "${post.title}" (id: ${post.id})`);

  try {
    const result = await pool.query(
      `SELECT email FROM subscribers WHERE is_active = TRUE`
    );
    const subscribers = result.rows;

    if (subscribers.length === 0) {
      console.log('[notifySubscribers] No active subscribers — skipping.');
      return;
    }

    console.log(`[notifySubscribers] Sending to ${subscribers.length} subscriber(s)...`);

    const siteUrl = (process.env.FRONTEND_URL || 'https://faizalamfaizi.com').replace(/\/$/, '');
    const postUrl = `${siteUrl}/blogs/${post.slug}`;

    // Create transporter ONCE and reuse for all subscribers
    const transporter = createTransporter();

    // Verify SMTP before sending batch
    try {
      await transporter.verify();
      console.log('[notifySubscribers] SMTP verified ✓');
    } catch (verifyErr) {
      console.error('[notifySubscribers] SMTP verification failed — aborting:', verifyErr.message);
      return;
    }

    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      try {
        const unsubLink = `${siteUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}`;

        await transporter.sendMail({
          from: `Faiz Alam Faizi <${process.env.SMTP_FROM}>`,
          to: sub.email,
          subject: `New Article: ${post.title}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#222;line-height:1.6;">
              <div style="background:#111;padding:24px 32px;border-radius:12px 12px 0 0;">
                <img src="${siteUrl}/faiz-alam-faizi-logo1.webp" alt="Faiz Alam Faizi" style="height:48px;width:auto;" />
              </div>
              <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #eee;">
                <p style="color:#888;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 12px;">New Article Published</p>
                <h1 style="font-size:22px;font-weight:900;color:#111;margin:0 0 16px;">${post.title}</h1>
                ${post.excerpt ? `<p style="color:#555;font-size:15px;margin:0 0 24px;">${post.excerpt}</p>` : ''}
                <a href="${postUrl}" style="display:inline-block;background:#d4af37;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:50px;text-decoration:none;">Read Article →</a>
                <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
                <p style="color:#aaa;font-size:12px;margin:0;">
                  You are receiving this because you subscribed at faizalamfaizi.com.<br/>
                  <a href="${unsubLink}" style="color:#aaa;">Unsubscribe</a>
                </p>
              </div>
            </div>
          `,
          text: `New article: ${post.title}\n\nRead it here: ${postUrl}\n\nUnsubscribe: ${unsubLink}`,
        });

        console.log(`[notifySubscribers] ✓ Sent to ${sub.email}`);
        sent++;
      } catch (emailErr) {
        console.error(`[notifySubscribers] ✗ Failed for ${sub.email}:`, emailErr.message);
        failed++;
      }
    }

    console.log(`[notifySubscribers] Done — sent: ${sent}, failed: ${failed}`);
  } catch (error) {
    console.error('[notifySubscribers] Fatal error:', error.message);
  }
}

module.exports = {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
  testEmail,
  notifySubscribers,
};
