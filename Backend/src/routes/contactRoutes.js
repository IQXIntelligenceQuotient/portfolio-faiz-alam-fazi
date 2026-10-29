const express = require("express");
const router = express.Router();

const {
  sendContact,
  getAllContacts,
  updateContactStatus,
  updateStatus,
  sendEmail,
  deleteContact,
  replyToContact
} = require("../controller/contactController");

const authMiddleware = require("../middleware/authMiddleware");

// PUBLIC: website contact form
router.post("/", sendContact);

// ADMIN: view, update and delete contact inquiries
router.get("/admin/all", authMiddleware, getAllContacts);
router.put("/admin/:id", authMiddleware, updateContactStatus);
router.delete("/admin/:id", authMiddleware, deleteContact);
router.post("/admin/reply/:id", authMiddleware, replyToContact);

// ADMIN: independent inquiry/email status management (Requirements 2.1, 2.2, 2.3)
router.put("/:id/status", authMiddleware, updateStatus);

// ADMIN: send email to contact with retry logic (Requirements 2.4, 2.5, 2.6)
router.post("/:id/send-email", authMiddleware, sendEmail);

module.exports = router;
