const router = require("express").Router();

const ReviewController = require("../controller/ReviewController");
const authMiddleware = require("../middleware/authMiddleware");

// PUBLIC ROUTES
router.get("/", ReviewController.getPublicReviews);
router.post("/", ReviewController.create);

// ADMIN ROUTES
router.get("/admin/all", authMiddleware, ReviewController.getAll);
router.put("/:id", authMiddleware, ReviewController.update);
router.delete("/:id", authMiddleware, ReviewController.remove);

// ADMIN: Communication routes (Requirements 1.1, 1.2, 1.4, 1.5, 1.6)
router.post("/:id/communication", authMiddleware, ReviewController.sendCommunication);
router.put("/:id/communication-status", authMiddleware, ReviewController.updateCommunicationStatus);

module.exports = router;
