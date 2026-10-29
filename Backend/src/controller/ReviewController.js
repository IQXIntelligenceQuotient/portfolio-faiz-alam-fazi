const pool = require("../config/db");
const { createTransporter } = require("../config/mailer");

// ADDED: Simple email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ADDED: Valid predefined message templates
const MESSAGE_TEMPLATES = ['review_approved', 'thank_you', 'review_published', 'custom'];

// ADDED: Build email content for each predefined template
function buildEmailContent(template, reviewerName, customMessage) {
  const templates = {
    review_approved: {
      subject: 'Your Review Has Been Approved',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
          <p>Dear ${reviewerName},</p>
          <p>We are pleased to inform you that your review has been <strong>approved</strong> and is now visible on our website.</p>
          <p>Thank you for taking the time to share your experience.</p>
          <br>
          <p>Regards,</p>
          <p><strong>Faiz Alam Faizi</strong></p>
        </div>
      `,
      text: `Dear ${reviewerName},\n\nWe are pleased to inform you that your review has been approved and is now visible on our website.\n\nThank you for taking the time to share your experience.\n\nRegards,\nFaiz Alam Faizi`
    },
    thank_you: {
      subject: 'Thank You for Your Review',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
          <p>Dear ${reviewerName},</p>
          <p>Thank you sincerely for leaving a review. Your feedback is greatly appreciated and helps us continue to improve our services.</p>
          <br>
          <p>Regards,</p>
          <p><strong>Faiz Alam Faizi</strong></p>
        </div>
      `,
      text: `Dear ${reviewerName},\n\nThank you sincerely for leaving a review. Your feedback is greatly appreciated and helps us continue to improve our services.\n\nRegards,\nFaiz Alam Faizi`
    },
    review_published: {
      subject: 'Your Review Is Now Published',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
          <p>Dear ${reviewerName},</p>
          <p>We are happy to let you know that your review has been <strong>published</strong> on our website and is now live for everyone to see.</p>
          <p>We truly value your support.</p>
          <br>
          <p>Regards,</p>
          <p><strong>Faiz Alam Faizi</strong></p>
        </div>
      `,
      text: `Dear ${reviewerName},\n\nWe are happy to let you know that your review has been published on our website and is now live for everyone to see.\n\nWe truly value your support.\n\nRegards,\nFaiz Alam Faizi`
    }
  };

  if (template === 'custom') {
    const safeMessage = customMessage || '';
    return {
      subject: 'A Message from Faiz Alam Faizi',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;">
          <p>Dear ${reviewerName},</p>
          <p>${safeMessage.replace(/\n/g, '<br>')}</p>
          <br>
          <p>Regards,</p>
          <p><strong>Faiz Alam Faizi</strong></p>
        </div>
      `,
      text: `Dear ${reviewerName},\n\n${safeMessage}\n\nRegards,\nFaiz Alam Faizi`
    };
  }

  return templates[template] || null;
}

class ReviewController {
  // PUBLIC: Get approved reviews only
  async getPublicReviews(req, res) {
    try {
      const result = await pool.query(
        `SELECT id, name, message, rating, created_at
         FROM reviews
         WHERE is_approved = TRUE
         ORDER BY created_at DESC`
      );

      res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching reviews",
        error: error.message
      });
    }
  }

  // ADMIN: Get all reviews with email
  async getAll(req, res) {
    try {
      const result = await pool.query(
        `SELECT *
         FROM reviews
         ORDER BY created_at DESC`
      );

      res.status(200).json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching admin reviews",
        error: error.message
      });
    }
  }

  // PUBLIC: Create review
  async create(req, res) {
    try {
      const { name, email, message, rating } = req.body;

      // ADDED: Validation
      if (!name || !email || !message || !rating) {
        return res.status(400).json({
          success: false,
          message: "Name, email, message and rating are required"
        });
      }

      // ADDED: Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format"
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5"
        });
      }

      const result = await pool.query(
        `INSERT INTO reviews (name, email, message, rating)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, message, rating, created_at`,
        [name, email, message, rating]
      );

      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: result.rows[0]
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating review",
        error: error.message
      });
    }
  }

  // ADMIN: Update review
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, message, rating, is_approved } = req.body;

      // ADDED: Validation
      if (!name || !email || !message || rating === undefined) {
        return res.status(400).json({
          success: false,
          message: "Name, email, message and rating are required"
        });
      }

      // ADDED: Validate email format
      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format"
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5"
        });
      }

      const result = await pool.query(
        `UPDATE reviews SET
          name = $1,
          email = $2,
          message = $3,
          rating = $4,
          is_approved = $5,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [name, email, message, rating, is_approved !== undefined ? is_approved : false, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Review not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: result.rows[0]
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating review",
        error: error.message
      });
    }
  }

  // ADMIN: Delete review
  async remove(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `DELETE FROM reviews
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Review not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Review deleted successfully"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting review",
        error: error.message
      });
    }
  }

  // ADMIN: Send communication message to reviewer
  // Requirements: 1.1, 1.2, 1.4, 1.5, 1.6
  async sendCommunication(req, res) {
    try {
      const { id } = req.params;
      const { messageTemplate, customMessage } = req.body;

      // Validate messageTemplate
      if (!messageTemplate || !MESSAGE_TEMPLATES.includes(messageTemplate)) {
        return res.status(400).json({
          success: false,
          message: `messageTemplate must be one of: ${MESSAGE_TEMPLATES.join(', ')}`
        });
      }

      // Custom messages require text
      if (messageTemplate === 'custom' && (!customMessage || !customMessage.trim())) {
        return res.status(400).json({
          success: false,
          message: "customMessage is required when messageTemplate is 'custom'"
        });
      }

      // Fetch the review
      const reviewResult = await pool.query(
        `SELECT * FROM reviews WHERE id = $1`,
        [id]
      );

      if (reviewResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Review not found"
        });
      }

      const review = reviewResult.rows[0];

      // Build email content from template
      const emailContent = buildEmailContent(messageTemplate, review.name, customMessage);

      if (!emailContent) {
        return res.status(400).json({
          success: false,
          message: "Invalid message template"
        });
      }

      let emailSent = false;
      let emailError = null;

      // Attempt to send the email
      try {
        const transporter = createTransporter();
        const mailOptions = {
          from: `Faiz Alam Faizi <${process.env.SMTP_FROM}>`,
          to: review.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("[review-mailer] Email sent:", info.messageId);
        emailSent = true;
      } catch (emailErr) {
        console.error("[review-mailer] Email failed:", emailErr.message);
        emailError = emailErr.message;
      }

      // Determine communication status based on email result
      const newCommunicationStatus = emailSent ? 'email_sent' : 'email_failed';

      // Update the review record with communication tracking
      // Per Requirement 1.4: record message type and timestamp even if DB write fails after email
      // Per Requirement 1.5: update to 'email_failed' even if logging fails
      try {
        const updateResult = await pool.query(
          `UPDATE reviews SET
            communication_status = $1,
            last_message_type = $2,
            last_message_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = $3
           RETURNING *`,
          [newCommunicationStatus, messageTemplate, id]
        );

        const updatedReview = updateResult.rows[0];

        return res.status(200).json({
          success: true,
          message: emailSent
            ? "Communication sent successfully"
            : "Email delivery failed; communication status updated to 'email_failed'",
          data: updatedReview,
          emailSent,
          ...(emailError && { emailError })
        });

      } catch (dbErr) {
        // DB write failed after email attempt — per Req 1.4 we accept this
        console.error("[review-mailer] DB update failed after email attempt:", dbErr.message);

        return res.status(200).json({
          success: emailSent,
          message: emailSent
            ? "Email sent but communication status could not be recorded"
            : "Email delivery failed and communication status could not be recorded",
          emailSent,
          emailError: emailError || null,
          dbError: dbErr.message
        });
      }

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error sending communication",
        error: error.message
      });
    }
  }

  // ADMIN: Update communication status for a review
  // Requirements: 1.3, 1.4, 1.5
  async updateCommunicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { communication_status, last_message_type, last_message_date } = req.body;

      // At least one field must be provided
      if (communication_status === undefined && last_message_type === undefined && last_message_date === undefined) {
        return res.status(400).json({
          success: false,
          message: "At least one of communication_status, last_message_type, or last_message_date must be provided"
        });
      }

      // Validate communication_status if provided
      const validCommunicationStatuses = ['email_sent', 'email_pending', 'email_failed', 'message_sent'];
      if (communication_status !== undefined && !validCommunicationStatuses.includes(communication_status)) {
        return res.status(400).json({
          success: false,
          message: `communication_status must be one of: ${validCommunicationStatuses.join(', ')}`
        });
      }

      // Validate last_message_type if provided
      if (last_message_type !== undefined && !MESSAGE_TEMPLATES.includes(last_message_type)) {
        return res.status(400).json({
          success: false,
          message: `last_message_type must be one of: ${MESSAGE_TEMPLATES.join(', ')}`
        });
      }

      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (communication_status !== undefined) {
        updates.push(`communication_status = $${paramCount}`);
        values.push(communication_status);
        paramCount++;
      }

      if (last_message_type !== undefined) {
        updates.push(`last_message_type = $${paramCount}`);
        values.push(last_message_type);
        paramCount++;
      }

      if (last_message_date !== undefined) {
        updates.push(`last_message_date = $${paramCount}`);
        values.push(last_message_date);
        paramCount++;
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE reviews SET
          ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Review not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Communication status updated successfully",
        data: result.rows[0]
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating communication status",
        error: error.message
      });
    }
  }
}

module.exports = new ReviewController();
