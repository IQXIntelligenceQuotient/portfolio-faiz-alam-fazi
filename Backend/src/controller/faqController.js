const pool = require('../config/db');

const createFaq = async (req, res) => {
  try {
    const { post_id, question, answer, sort_order } = req.body;

    if (!post_id || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'post_id, question and answer are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO faqs (post_id, question, answer, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [post_id, question, answer, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message
    });
  }
};

const getFaqsByPost = async (req, res) => {
  try {
    const { post_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM faqs
       WHERE post_id = $1
       ORDER BY sort_order ASC`,
      [post_id]
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message
    });
  }
};

const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, sort_order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'question and answer are required'
      });
    }

    const updatedFaq = await pool.query(
      `UPDATE faqs SET
        question = $1,
        answer = $2,
        sort_order = $3
       WHERE id = $4
       RETURNING *`,
      [question, answer, sort_order || 0, id]
    );

    if (updatedFaq.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    const postId = updatedFaq.rows[0].post_id;

    const allFaqs = await pool.query(
      `SELECT * FROM faqs
       WHERE post_id = $1
       ORDER BY sort_order ASC`,
      [postId]
    );

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: allFaqs.rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message
    });
  }
};

const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM faqs WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting FAQ',
      error: error.message
    });
  }
};

module.exports = {
  createFaq,
  getFaqsByPost,
  updateFaq,
  deleteFaq
};
