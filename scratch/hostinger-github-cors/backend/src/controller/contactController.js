const pool = require("../config/db");
const { createTransporter } = require("../config/mailer");

// ADDED: Simple email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Valid inquiry status values
const VALID_INQUIRY_STATUSES = ['new', 'read', 'responded', 'closed'];

// Valid email status values
const VALID_EMAIL_STATUSES = ['not_sent', 'drafted', 'sent', 'failed'];

// Predefined response message templates for contacts
const CONTACT_MESSAGE_TEMPLATES = {
  acknowledgement: {
    subject: 'We Received Your Inquiry',
    buildHtml: (name) => `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
        <p>Dear ${name},</p>
        <p>Thank you for reaching out. We have received your inquiry and will get back to you as soon as possible.</p>
        <br>
        <p>Regards,</p>
        <p><strong>Faiz Alam Faizi</strong></p>
      </div>
    `,
    buildText: (name) => `Dear ${name},\n\nThank you for reaching out. We have received your inquiry and will get back to you as soon as possible.\n\nRegards,\nFaiz Alam Faizi`
  },
  follow_up: {
    subject: 'Following Up on Your Inquiry',
    buildHtml: (name) => `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
        <p>Dear ${name},</p>
        <p>We wanted to follow up on your recent inquiry. Please let us know if you have any additional questions or if there is anything else we can help you with.</p>
        <br>
        <p>Regards,</p>
        <p><strong>Faiz Alam Faizi</strong></p>
      </div>
    `,
    buildText: (name) => `Dear ${name},\n\nWe wanted to follow up on your recent inquiry. Please let us know if you have any additional questions or if there is anything else we can help you with.\n\nRegards,\nFaiz Alam Faizi`
  },
  closed: {
    subject: 'Your Inquiry Has Been Resolved',
    buildHtml: (name) => `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
        <p>Dear ${name},</p>
        <p>We are writing to let you know that your inquiry has been resolved and marked as closed. If you need further assistance, please do not hesitate to contact us again.</p>
        <br>
        <p>Regards,</p>
        <p><strong>Faiz Alam Faizi</strong></p>
      </div>
    `,
    buildText: (name) => `Dear ${name},\n\nWe are writing to let you know that your inquiry has been resolved and marked as closed. If you need further assistance, please do not hesitate to contact us again.\n\nRegards,\nFaiz Alam Faizi`
  }
};

/**
 * Send an email with retry logic (up to maxRetries attempts, exponential backoff).
 * Returns { success, messageId, error }.
 */
async function sendEmailWithRetry(mailOptions, maxRetries = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = createTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`[contact-mailer] Email sent on attempt ${attempt}:`, info.messageId);
      return { success: true, messageId: info.messageId, error: null };
    } catch (err) {
      lastError = err;
      console.error(`[contact-mailer] Attempt ${attempt} failed:`, err.message);

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, ...
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[contact-mailer] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return { success: false, messageId: null, error: lastError ? lastError.message : 'Unknown error' };
}

async function sendContact(req, res) {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email and message are required."
    });
  }

  // ADDED: Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format."
    });
  }

  let savedInquiry;
  let emailSent = false;
  let emailError = null;

  try {
    // ADDED: Save contact inquiry into PostgreSQL first
    const result = await pool.query(
      `INSERT INTO contact_inquiries (name, email, subject, message, email_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, subject || null, message, 'pending']
    );

    savedInquiry = result.rows[0];

    // ADDED: Try to send email, but don't fail if it doesn't work
    try {
      const mailOptions = {
        from: `Faiz Alam Faizi <${process.env.SMTP_FROM}>`,
        to: process.env.CONTACT_RECEIVER,
        replyTo: email,
        subject: `New Client Inquiry | ${name}${subject ? ` | ${subject}` : ""}`,

        html: `
      <div style="background:#f4f4f4;padding:30px 0;font-family:Arial,sans-serif;">
        <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
          
          <div style="background:#0f0f0f;padding:25px;text-align:center;">
            <img src="https://faizalamfaizi.com/Business_Consultant_in_Lahore_Pakistan.svg"
                 alt="Faiz Alam Faizi"
                 style="max-width:220px;height:auto;margin-bottom:10px;">

            <p style="margin:5px 0 0;color:#c9a55c;font-size:13px;letter-spacing:1px;">
              PROFESSIONAL PORTFOLIO INQUIRY
            </p>
          </div>

          <div style="padding:25px;">
            <p style="font-size:15px;color:#333;margin-top:0;">
              You have received a new client inquiry from your website.
            </p>

            <table style="width:100%;border-collapse:collapse;margin-top:15px;">
              <tr>
                <td style="padding:10px;border:1px solid #eee;font-weight:bold;width:150px;">Name</td>
                <td style="padding:10px;border:1px solid #eee;">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px;border:1px solid #eee;font-weight:bold;">Email</td>
                <td style="padding:10px;border:1px solid #eee;">${email}</td>
              </tr>
              <tr>
                <td style="padding:10px;border:1px solid #eee;font-weight:bold;">Subject</td>
                <td style="padding:10px;border:1px solid #eee;">${subject || "Not provided"}</td>
              </tr>
            </table>

            <div style="margin-top:20px;">
              <p style="font-weight:bold;color:#333;margin-bottom:8px;">Message</p>
              <div style="background:#f8f8f8;padding:15px;border-radius:8px;border:1px solid #eee;white-space:pre-wrap;">
                ${message}
              </div>
            </div>

            <p style="margin-top:25px;font-size:14px;color:#666;">
              You can reply directly to this email to respond to this inquiry.
            </p>
          </div>

          <div style="background:#fafafa;padding:15px;text-align:center;font-size:12px;color:#999;">
            © ${new Date().getFullYear()} Faiz Alam Faizi | All Rights Reserved
          </div>
        </div>
      </div>
      `,

        text: `
New Portfolio Inquiry

Name: ${name}
Email: ${email}
Subject: ${subject || "-"}

Message:
${message}
      `.trim()
      };

      const transporter = createTransporter();
      const info = await transporter.sendMail(mailOptions);

      console.log("[mailer] Email sent:", info.messageId);
      emailSent = true;

      // ADDED: Update email_status to 'sent' if successful
      await pool.query(
        `UPDATE contact_inquiries SET email_status = 'sent' WHERE id = $1`,
        [savedInquiry.id]
      );

    } catch (emailErr) {
      // CHANGED: Log email error but don't fail the request
      console.error("[mailer] Email failed:", emailErr.message);
      emailError = emailErr.message;

      // ADDED: Update email_status to 'failed'
      await pool.query(
        `UPDATE contact_inquiries SET email_status = 'failed' WHERE id = $1`,
        [savedInquiry.id]
      );
    }

    // CHANGED: Always return success if inquiry was saved
    return res.status(200).json({
      success: true,
      message: "Inquiry submitted successfully.",
      data: savedInquiry,
      emailSent,
      ...(emailError && { emailError })
    });

  } catch (error) {
    console.error("[contact] Database error:", error.message);

    return res.status(500).json({
      success: false,
      message: `Failed to submit inquiry: ${error.message}`
    });
  }
}

// ADMIN: Get all contact inquiries
async function getAllContacts(req, res) {
  try {
    const result = await pool.query(
      `SELECT *
       FROM contact_inquiries
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contact inquiries",
      error: error.message
    });
  }
}

// ADMIN: Update inquiry status
async function updateContactStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, email_status } = req.body;

    // Build update query dynamically based on what fields are provided
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (email_status !== undefined) {
      updates.push(`email_status = $${paramCount}`);
      values.push(email_status);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE contact_inquiries SET
        ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry updated successfully",
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating inquiry",
      error: error.message
    });
  }
}

// ADMIN: Delete contact inquiry
async function deleteContact(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM contact_inquiries
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting inquiry",
      error: error.message
    });
  }
}
async function replyToContact(req, res) {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required."
      });
    }

    const inquiryResult = await pool.query(
      `SELECT * FROM contact_inquiries WHERE id = $1`,
      [id]
    );

    if (inquiryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found."
      });
    }

    const inquiry = inquiryResult.rows[0];

    const transporter = createTransporter();

    const mailOptions = {
      from: `Faiz Alam Faizi <${process.env.SMTP_FROM}>`,
      to: inquiry.email,
      subject: `Re: ${inquiry.subject || "Your Inquiry"}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
          <p>Dear ${inquiry.name},</p>

          <p>${replyMessage.replace(/\n/g, "<br>")}</p>

          <br>

          <p>Regards,</p>
          <p><strong>Faiz Alam Faizi</strong></p>
        </div>
      `,
      text: `
Dear ${inquiry.name},

${replyMessage}

Regards,
Faiz Alam Faizi
      `.trim()
    };

    const info = await transporter.sendMail(mailOptions);

    await pool.query(
      `UPDATE contact_inquiries
       SET email_status = 'sent',
           status = 'responded',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Reply sent to client successfully.",
      messageId: info.messageId
    });

  } catch (error) {
    console.error("[client reply] Email failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send reply to client.",
      error: error.message
    });
  }
}

// ADMIN: Update inquiry status ONLY — admin manual control
// Email status is managed automatically by the system (sendEmail, sendContact)
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { inquiry_status, email_status } = req.body;

    if (inquiry_status === undefined && email_status === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one of inquiry_status or email_status must be provided"
      });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (inquiry_status !== undefined) {
      if (!VALID_INQUIRY_STATUSES.includes(inquiry_status)) {
        return res.status(400).json({
          success: false,
          message: `inquiry_status must be one of: ${VALID_INQUIRY_STATUSES.join(', ')}`
        });
      }
      updates.push(`status = $${paramCount}`);
      values.push(inquiry_status);
      paramCount++;
    }

    if (email_status !== undefined) {
      if (!VALID_EMAIL_STATUSES.includes(email_status)) {
        return res.status(400).json({
          success: false,
          message: `email_status must be one of: ${VALID_EMAIL_STATUSES.join(', ')}`
        });
      }
      updates.push(`email_status = $${paramCount}`);
      values.push(email_status);
      paramCount++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE contact_inquiries SET
        ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry status updated successfully",
      data: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating inquiry status",
      error: error.message
    });
  }
}

// ADMIN: Send email to contact with retry logic
// Requirements: 2.4, 2.5, 2.6
async function sendEmail(req, res) {
  try {
    const { id } = req.params;
    const { messageTemplate, customMessage } = req.body;

    // Validate messageTemplate if provided (optional — falls back to custom)
    const validTemplates = [...Object.keys(CONTACT_MESSAGE_TEMPLATES), 'custom'];
    if (messageTemplate !== undefined && !validTemplates.includes(messageTemplate)) {
      return res.status(400).json({
        success: false,
        message: `messageTemplate must be one of: ${validTemplates.join(', ')}`
      });
    }

    // Custom messages require text
    const effectiveTemplate = messageTemplate || 'custom';
    if (effectiveTemplate === 'custom' && (!customMessage || !customMessage.trim())) {
      return res.status(400).json({
        success: false,
        message: "customMessage is required when messageTemplate is 'custom' or not provided"
      });
    }

    // Fetch the contact inquiry
    const inquiryResult = await pool.query(
      `SELECT * FROM contact_inquiries WHERE id = $1`,
      [id]
    );

    if (inquiryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found"
      });
    }

    const inquiry = inquiryResult.rows[0];

    // Build email content
    let subject, html, text;

    if (effectiveTemplate === 'custom') {
      const safeMessage = (customMessage || '').trim();
      subject = `Re: ${inquiry.subject || 'Your Inquiry'}`;
      html = `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
          <p>Dear ${inquiry.name},</p>
          <p>${safeMessage.replace(/\n/g, '<br>')}</p>
          <br>
          <p>Regards,</p>
          <p><strong>Faiz Alam Faizi</strong></p>
        </div>
      `;
      text = `Dear ${inquiry.name},\n\n${safeMessage}\n\nRegards,\nFaiz Alam Faizi`;
    } else {
      const template = CONTACT_MESSAGE_TEMPLATES[effectiveTemplate];
      subject = template.subject;
      html = template.buildHtml(inquiry.name);
      text = template.buildText(inquiry.name);
    }

    const mailOptions = {
      from: `Faiz Alam Faizi <${process.env.SMTP_FROM}>`,
      to: inquiry.email,
      subject,
      html,
      text
    };

    // Attempt to send with retry logic (up to 3 retries, exponential backoff)
    const emailResult = await sendEmailWithRetry(mailOptions, 3);

    if (emailResult.success) {
      // Automate inquiry status updates
      const newInquiryStatus = effectiveTemplate === 'closed' ? 'closed' : 'responded';

      // Requirement 2.5: Update email_status to 'sent' only if timestamp is successfully recorded
      const updateResult = await pool.query(
        `UPDATE contact_inquiries
         SET email_status = 'sent',
             email_sent_date = CURRENT_TIMESTAMP,
             status = $1,
             last_error_message = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [newInquiryStatus, id]
      );

      return res.status(200).json({
        success: true,
        message: "Email sent successfully",
        data: updateResult.rows[0],
        messageId: emailResult.messageId
      });

    } else {
      // Requirement 2.6: Update email_status to 'failed' on send failure
      const updateResult = await pool.query(
        `UPDATE contact_inquiries
         SET email_status = 'failed',
             last_error_message = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [emailResult.error, id]
      );

      return res.status(500).json({
        success: false,
        message: "Failed to send email after retries",
        data: updateResult.rows[0],
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error("[contact-mailer] Unexpected error:", error.message);

    // Best-effort: mark email as failed in DB
    try {
      await pool.query(
        `UPDATE contact_inquiries
         SET email_status = 'failed',
             last_error_message = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [error.message, req.params.id]
      );
    } catch (dbErr) {
      console.error("[contact-mailer] Could not update failure status:", dbErr.message);
    }

    res.status(500).json({
      success: false,
      message: "Error sending email",
      error: error.message
    });
  }
}

module.exports = {
  sendContact,
  getAllContacts,
  updateContactStatus,
  updateStatus,
  sendEmail,
  replyToContact,
  deleteContact
};
