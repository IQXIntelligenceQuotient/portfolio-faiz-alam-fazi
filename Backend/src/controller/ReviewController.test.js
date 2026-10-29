/**
 * Unit Tests: ReviewController – sendCommunication & updateCommunicationStatus
 *
 * Requirements: 1.1, 1.2, 1.4, 1.5, 1.6
 *
 * Mocks the DB pool and mailer so no live connections are needed.
 */

jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../config/mailer', () => ({
  createTransporter: jest.fn(),
}));

const pool = require('../config/db');
const { createTransporter } = require('../config/mailer');
const reviewController = require('./ReviewController');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq({ params = {}, body = {} } = {}) {
  return { params, body };
}

/** Returns a mock transporter whose sendMail resolves successfully. */
function mockTransporterSuccess(messageId = 'msg-001') {
  return { sendMail: jest.fn().mockResolvedValue({ messageId }) };
}

/** Returns a mock transporter whose sendMail rejects. */
function mockTransporterFailure(message = 'SMTP error') {
  return { sendMail: jest.fn().mockRejectedValue(new Error(message)) };
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SMTP_FROM = 'test@example.com';
});

// ─── sendCommunication ────────────────────────────────────────────────────────

describe('sendCommunication', () => {
  const reviewRow = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    message: 'Great work!',
    rating: 5,
    is_approved: true,
    communication_status: null,
  };

  const updatedRow = {
    ...reviewRow,
    communication_status: 'email_sent',
    last_message_type: 'review_approved',
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  test('returns 400 when messageTemplate is missing', async () => {
    const req = mockReq({ params: { id: '1' }, body: {} });
    const res = mockRes();

    await reviewController.sendCommunication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('returns 400 when messageTemplate is not a valid option', async () => {
    const req = mockReq({ params: { id: '1' }, body: { messageTemplate: 'invalid_template' } });
    const res = mockRes();

    await reviewController.sendCommunication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('returns 400 when template is "custom" but customMessage is empty (Requirement 1.6)', async () => {
    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'custom', customMessage: '   ' },
    });
    const res = mockRes();

    await reviewController.sendCommunication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  // ── Not found ───────────────────────────────────────────────────────────────

  test('returns 404 when review does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // SELECT review

    const req = mockReq({ params: { id: '99' }, body: { messageTemplate: 'thank_you' } });
    const res = mockRes();

    await reviewController.sendCommunication(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Review not found' })
    );
  });

  // ── Successful email send ───────────────────────────────────────────────────

  test('sends predefined message and updates communication_status to "email_sent" (Requirement 1.4)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [reviewRow] })   // SELECT review
      .mockResolvedValueOnce({ rows: [updatedRow] }); // UPDATE review

    createTransporter.mockReturnValue(mockTransporterSuccess());

    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'review_approved' },
    });
    const res = mockRes();

    await reviewController.sendCommunication(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.emailSent).toBe(true);

    // Verify DB was updated with email_sent status
    const updateCall = pool.query.mock.calls[1];
    expect(updateCall[1]).toContain('email_sent');
    expect(updateCall[1]).toContain('review_approved');
  });

  test('sends custom message when template is "custom" with valid customMessage (Requirement 1.6)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [reviewRow] })
      .mockResolvedValueOnce({ rows: [{ ...updatedRow, last_message_type: 'custom' }] });

    createTransporter.mockReturnValue(mockTransporterSuccess());

    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'custom', customMessage: 'Hello Alice, thank you!' },
    });
    const res = mockRes();

    await reviewController.sendCommunication(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.emailSent).toBe(true);
  });

  // ── Email failure ───────────────────────────────────────────────────────────

  test('updates communication_status to "email_failed" when email send fails (Requirement 1.5)', async () => {
    const failedRow = { ...reviewRow, communication_status: 'email_failed' };

    pool.query
      .mockResolvedValueOnce({ rows: [reviewRow] })   // SELECT review
      .mockResolvedValueOnce({ rows: [failedRow] });  // UPDATE review

    createTransporter.mockReturnValue(mockTransporterFailure('SMTP timeout'));

    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'thank_you' },
    });
    const res = mockRes();

    await reviewController.sendCommunication(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.emailSent).toBe(false);
    expect(body.emailError).toBeDefined();

    // DB should be updated with email_failed
    const updateCall = pool.query.mock.calls[1];
    expect(updateCall[1]).toContain('email_failed');
  });

  test('still returns 200 with emailSent=false when DB update fails after email failure (Requirement 1.5)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [reviewRow] })   // SELECT review
      .mockRejectedValueOnce(new Error('DB write failed')); // UPDATE fails

    createTransporter.mockReturnValue(mockTransporterFailure('SMTP error'));

    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'review_published' },
    });
    const res = mockRes();

    await reviewController.sendCommunication(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.emailSent).toBe(false);
    expect(body.dbError).toBeDefined();
  });

  test('returns 500 on unexpected error (e.g. DB select fails)', async () => {
    pool.query.mockRejectedValueOnce(new Error('Connection lost'));

    const req = mockReq({ params: { id: '1' }, body: { messageTemplate: 'thank_you' } });
    const res = mockRes();

    await reviewController.sendCommunication(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

// ─── updateCommunicationStatus ────────────────────────────────────────────────

describe('updateCommunicationStatus', () => {
  const updatedRow = {
    id: 1,
    communication_status: 'email_sent',
    last_message_type: 'thank_you',
    last_message_date: '2024-01-01T00:00:00Z',
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  test('returns 400 when no fields are provided', async () => {
    const req = mockReq({ params: { id: '1' }, body: {} });
    const res = mockRes();

    await reviewController.updateCommunicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('returns 400 when communication_status is invalid', async () => {
    const req = mockReq({
      params: { id: '1' },
      body: { communication_status: 'unknown_status' },
    });
    const res = mockRes();

    await reviewController.updateCommunicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('returns 400 when last_message_type is invalid', async () => {
    const req = mockReq({
      params: { id: '1' },
      body: { last_message_type: 'not_a_template' },
    });
    const res = mockRes();

    await reviewController.updateCommunicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  // ── Not found ───────────────────────────────────────────────────────────────

  test('returns 404 when review does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({
      params: { id: '99' },
      body: { communication_status: 'email_sent' },
    });
    const res = mockRes();

    await reviewController.updateCommunicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Review not found' })
    );
  });

  // ── Successful updates ──────────────────────────────────────────────────────

  test('updates communication_status only when only that field is provided (Requirement 1.3)', async () => {
    pool.query.mockResolvedValueOnce({ rows: [updatedRow] });

    const req = mockReq({
      params: { id: '1' },
      body: { communication_status: 'email_sent' },
    });
    const res = mockRes();

    await reviewController.updateCommunicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data).toEqual(updatedRow);

    // Query should include communication_status but not last_message_type
    const queryStr = pool.query.mock.calls[0][0];
    expect(queryStr).toContain('communication_status');
    expect(queryStr).not.toContain('last_message_type');
  });

  test('updates last_message_type only when only that field is provided', async () => {
    const row = { ...updatedRow, last_message_type: 'custom' };
    pool.query.mockResolvedValueOnce({ rows: [row] });

    const req = mockReq({
      params: { id: '1' },
      body: { last_message_type: 'custom' },
    });
    const res = mockRes();

    await reviewController.updateCommunicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const queryStr = pool.query.mock.calls[0][0];
    expect(queryStr).toContain('last_message_type');
    expect(queryStr).not.toContain('communication_status');
  });

  test('updates multiple fields when all are provided', async () => {
    pool.query.mockResolvedValueOnce({ rows: [updatedRow] });

    const req = mockReq({
      params: { id: '1' },
      body: {
        communication_status: 'email_sent',
        last_message_type: 'thank_you',
        last_message_date: '2024-01-01T00:00:00Z',
      },
    });
    const res = mockRes();

    await reviewController.updateCommunicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const queryStr = pool.query.mock.calls[0][0];
    expect(queryStr).toContain('communication_status');
    expect(queryStr).toContain('last_message_type');
    expect(queryStr).toContain('last_message_date');
  });

  test('accepts all valid communication_status values', async () => {
    const validStatuses = ['email_sent', 'email_pending', 'email_failed', 'message_sent'];

    for (const status of validStatuses) {
      jest.clearAllMocks();
      pool.query.mockResolvedValueOnce({ rows: [{ ...updatedRow, communication_status: status }] });

      const req = mockReq({ params: { id: '1' }, body: { communication_status: status } });
      const res = mockRes();

      await reviewController.updateCommunicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    }
  });

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const req = mockReq({
      params: { id: '1' },
      body: { communication_status: 'email_sent' },
    });
    const res = mockRes();

    await reviewController.updateCommunicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
