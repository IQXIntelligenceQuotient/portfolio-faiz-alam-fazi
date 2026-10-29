/**
 * Unit Tests: contactController – updateStatus & sendEmail
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 *
 * Key property under test:
 *   - inquiry_status and email_status are updated independently (Requirement 2.3)
 *   - email_status → 'sent' on success (Requirement 2.5)
 *   - email_status → 'failed' on failure (Requirement 2.6)
 *
 * Mocks the DB pool and mailer so no live connections are needed.
 */

jest.mock('../config/db', () => ({ query: jest.fn() }));
jest.mock('../config/mailer', () => ({
  createTransporter: jest.fn(),
}));

const pool = require('../config/db');
const { createTransporter } = require('../config/mailer');
const { updateStatus, sendEmail } = require('./contactController');

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

function mockTransporterSuccess(messageId = 'msg-abc') {
  return { sendMail: jest.fn().mockResolvedValue({ messageId }) };
}

function mockTransporterFailure(message = 'SMTP error') {
  return { sendMail: jest.fn().mockRejectedValue(new Error(message)) };
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.SMTP_FROM = 'test@example.com';
});

// ─── updateStatus ─────────────────────────────────────────────────────────────

describe('updateStatus', () => {
  const baseRow = {
    id: 1,
    name: 'Bob',
    email: 'bob@example.com',
    status: 'new',
    email_status: 'not_sent',
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  test('returns 400 when neither inquiry_status nor email_status is provided', async () => {
    const req = mockReq({ params: { id: '1' }, body: {} });
    const res = mockRes();

    await updateStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('returns 400 when inquiry_status is invalid', async () => {
    const req = mockReq({ params: { id: '1' }, body: { inquiry_status: 'unknown' } });
    const res = mockRes();

    await updateStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test('returns 400 when email_status is invalid', async () => {
    const req = mockReq({ params: { id: '1' }, body: { email_status: 'bad_value' } });
    const res = mockRes();

    await updateStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  // ── Not found ───────────────────────────────────────────────────────────────

  test('returns 404 when inquiry does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({ params: { id: '99' }, body: { inquiry_status: 'read' } });
    const res = mockRes();

    await updateStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Inquiry not found' })
    );
  });

  // ── Independence of inquiry_status and email_status (Requirement 2.3) ───────

  test('updates only inquiry_status without touching email_status (Requirement 2.3)', async () => {
    const updatedRow = { ...baseRow, status: 'read' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow] });

    const req = mockReq({ params: { id: '1' }, body: { inquiry_status: 'read' } });
    const res = mockRes();

    await updateStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);

    // The SQL query should include 'status' but NOT 'email_status'
    const queryStr = pool.query.mock.calls[0][0];
    expect(queryStr).toContain('status');
    expect(queryStr).not.toContain('email_status');
  });

  test('updates only email_status without touching inquiry_status (Requirement 2.3)', async () => {
    const updatedRow = { ...baseRow, email_status: 'drafted' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow] });

    const req = mockReq({ params: { id: '1' }, body: { email_status: 'drafted' } });
    const res = mockRes();

    await updateStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);

    // The SQL query should include 'email_status' but NOT a bare 'status =' assignment
    const queryStr = pool.query.mock.calls[0][0];
    expect(queryStr).toContain('email_status');
    // The query should NOT contain a standalone `status = $N` (i.e. the inquiry status column)
    // We check that the word "status" only appears as part of "email_status"
    expect(queryStr).not.toMatch(/(?<![a-z_])status\s*=/i);
  });

  test('updates both fields when both are provided (Requirement 2.3)', async () => {
    const updatedRow = { ...baseRow, status: 'responded', email_status: 'sent' };
    pool.query.mockResolvedValueOnce({ rows: [updatedRow] });

    const req = mockReq({
      params: { id: '1' },
      body: { inquiry_status: 'responded', email_status: 'sent' },
    });
    const res = mockRes();

    await updateStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const queryStr = pool.query.mock.calls[0][0];
    expect(queryStr).toContain('status');
    expect(queryStr).toContain('email_status');
  });

  test('accepts all valid inquiry_status values (Requirement 2.1)', async () => {
    const validStatuses = ['new', 'read', 'responded', 'closed'];

    for (const status of validStatuses) {
      jest.clearAllMocks();
      pool.query.mockResolvedValueOnce({ rows: [{ ...baseRow, status }] });

      const req = mockReq({ params: { id: '1' }, body: { inquiry_status: status } });
      const res = mockRes();

      await updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    }
  });

  test('accepts all valid email_status values (Requirement 2.2)', async () => {
    const validStatuses = ['not_sent', 'drafted', 'sent', 'failed'];

    for (const status of validStatuses) {
      jest.clearAllMocks();
      pool.query.mockResolvedValueOnce({ rows: [{ ...baseRow, email_status: status }] });

      const req = mockReq({ params: { id: '1' }, body: { email_status: status } });
      const res = mockRes();

      await updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    }
  });

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));

    const req = mockReq({ params: { id: '1' }, body: { inquiry_status: 'read' } });
    const res = mockRes();

    await updateStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

// ─── sendEmail ────────────────────────────────────────────────────────────────

describe('sendEmail', () => {
  const inquiryRow = {
    id: 1,
    name: 'Carol',
    email: 'carol@example.com',
    subject: 'Project inquiry',
    message: 'Hello!',
    status: 'new',
    email_status: 'not_sent',
  };

  const sentRow = { ...inquiryRow, email_status: 'sent', email_sent_date: new Date().toISOString() };
  const failedRow = { ...inquiryRow, email_status: 'failed', last_error_message: 'SMTP error' };

  // ── Validation ──────────────────────────────────────────────────────────────

  test('returns 400 when template is "custom" but customMessage is missing', async () => {
    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'custom' },
    });
    const res = mockRes();

    await sendEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('returns 400 when messageTemplate is invalid', async () => {
    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'not_a_template', customMessage: 'Hi' },
    });
    const res = mockRes();

    await sendEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ── Not found ───────────────────────────────────────────────────────────────

  test('returns 404 when inquiry does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const req = mockReq({
      params: { id: '99' },
      body: { messageTemplate: 'acknowledgement' },
    });
    const res = mockRes();

    await sendEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Inquiry not found' })
    );
  });

  // ── Successful send (Requirement 2.5) ────────────────────────────────────────

  test('updates email_status to "sent" when email is delivered successfully (Requirement 2.5)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [inquiryRow] })  // SELECT inquiry
      .mockResolvedValueOnce({ rows: [sentRow] });    // UPDATE email_status='sent'

    createTransporter.mockReturnValue(mockTransporterSuccess());

    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'acknowledgement' },
    });
    const res = mockRes();

    await sendEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.data.email_status).toBe('sent');

    // Verify the UPDATE query sets email_status = 'sent'
    const updateCall = pool.query.mock.calls[1];
    expect(updateCall[0]).toContain("email_status = 'sent'");
  });

  test('sends predefined template email (acknowledgement) successfully', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [inquiryRow] })
      .mockResolvedValueOnce({ rows: [sentRow] });

    const mockTransporter = mockTransporterSuccess('msg-123');
    createTransporter.mockReturnValue(mockTransporter);

    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'acknowledgement' },
    });
    const res = mockRes();

    await sendEmail(req, res);

    expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
    const mailArgs = mockTransporter.sendMail.mock.calls[0][0];
    expect(mailArgs.to).toBe(inquiryRow.email);
    expect(mailArgs.subject).toBeDefined();
  });

  test('sends custom message email successfully', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [inquiryRow] })
      .mockResolvedValueOnce({ rows: [sentRow] });

    createTransporter.mockReturnValue(mockTransporterSuccess());

    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'custom', customMessage: 'Dear Carol, here is our response.' },
    });
    const res = mockRes();

    await sendEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
  });

  // ── Failed send (Requirement 2.6) ────────────────────────────────────────────

  test('updates email_status to "failed" when all retries are exhausted (Requirement 2.6)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [inquiryRow] })  // SELECT inquiry
      .mockResolvedValueOnce({ rows: [failedRow] });  // UPDATE email_status='failed'

    // All retry attempts fail
    createTransporter.mockReturnValue(mockTransporterFailure('Connection refused'));

    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'follow_up' },
    });
    const res = mockRes();

    await sendEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.data.email_status).toBe('failed');

    // Verify the UPDATE query sets email_status = 'failed'
    const updateCall = pool.query.mock.calls[1];
    expect(updateCall[0]).toContain("email_status = 'failed'");
  });

  test('returns 500 on unexpected database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB connection lost'));

    const req = mockReq({
      params: { id: '1' },
      body: { messageTemplate: 'acknowledgement' },
    });
    const res = mockRes();

    await sendEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
