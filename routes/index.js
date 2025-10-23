import express from "express";
const router = express.Router();

// Import controllers
import { 
  getAllDevices, 
  getDeviceById, 
  updateDeviceStatus, 
  getDeviceHistory 
} from "../controllers/lightingcontroller.js";

import { 
  getAllSchedules, 
  createSchedule, 
  updateSchedule, 
  deleteSchedule 
} from "../controllers/schedulecontroller.js";

import { 
  getAllNotifications, 
  markAsRead, 
  createNotification 
} from "../controllers/notificationcontroller.js";

import { 
  loginPage as showLogin, 
  loginUser as login, 
  registerPage as showRegister, 
  registerUser as register, 
  dashboardPage as dashboard, 
  logoutUser as logout 
} from "../controllers/authController.js";

// Lighting routes
router.get("/api/devices", getAllDevices);
router.get("/api/devices/:id", getDeviceById);
router.put("/api/devices/:id/status", updateDeviceStatus);
router.get("/api/devices/:id/history", getDeviceHistory);

// Schedule routes
router.get("/api/schedules", getAllSchedules);
router.post("/api/schedules", createSchedule);
router.put("/api/schedules/:id", updateSchedule);
router.delete("/api/schedules/:id", deleteSchedule);

// Notification routes
router.get("/api/notifications", getAllNotifications);
router.put("/api/notifications/:id/read", markAsRead);
router.post("/api/notifications", createNotification);

// Auth routes
router.get("/", showLogin);
router.get("/login", showLogin);
router.post("/login", login);
router.get("/register", showRegister);
router.post("/register", register);
router.get("/dashboard", dashboard);
router.get("/logout", logout);

// Smart lighting pages
router.get("/monitoring", (req, res) => {
  res.render("monitoring");
});

router.get("/settings", (req, res) => {
  res.render("settings");
});

router.get("/history", (req, res) => {
  res.render("history");
});

router.get("/notifications", (req, res) => {
  res.render("notifications");
});

export default router;