const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Public: list verified mentors
router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT m.id, u.name, u.bio, m.institution, m.expertise, m.degrees, m.links, m.mentoring_formats, m.verification_status
       FROM mentors m JOIN users u ON u.id = m.user_id
       WHERE m.verification_status = 'verified'
       ORDER BY m.created_at DESC`
    )
    .all();
  res.json(rows);
});

// Authenticated: apply to become a mentor (creates a pending mentor profile)
router.post("/apply", requireAuth, (req, res) => {
  const { institution, expertise, degrees, links, mentoring_formats, price_note } = req.body || {};
  db.prepare("UPDATE users SET role = 'mentor' WHERE id = ?").run(req.user.id);
  const info = db
    .prepare(
      `INSERT INTO mentors (user_id, institution, expertise, degrees, links, mentoring_formats, price_note)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      institution || null,
      expertise || null,
      degrees || null,
      JSON.stringify(links || {}),
      mentoring_formats || null,
      price_note || null
    );
  res.status(201).json({ id: info.lastInsertRowid, status: "pending" });
});

// Admin: list pending mentor applications
router.get("/pending", requireAuth, requireRole("admin"), (req, res) => {
  const rows = db
    .prepare(
      `SELECT m.id, u.name, u.email, m.institution, m.expertise, m.mentoring_formats, m.created_at
       FROM mentors m JOIN users u ON u.id = m.user_id
       WHERE m.verification_status = 'pending'
       ORDER BY m.created_at DESC`
    )
    .all();
  res.json(rows);
});

// Admin: verify a mentor
router.post("/:id/verify", requireAuth, requireRole("admin"), (req, res) => {
  db.prepare("UPDATE mentors SET verification_status = 'verified' WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// Admin: reject a mentor
router.post("/:id/reject", requireAuth, requireRole("admin"), (req, res) => {
  db.prepare("UPDATE mentors SET verification_status = 'rejected' WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// Authenticated student: request guidance from a mentor
router.post("/:id/request", requireAuth, (req, res) => {
  const { context, request_text } = req.body || {};
  const mentor = db.prepare("SELECT id FROM mentors WHERE id = ?").get(req.params.id);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });

  const info = db
    .prepare(
      `INSERT INTO mentor_requests (student_id, mentor_id, context, request_text) VALUES (?, ?, ?, ?)`
    )
    .run(req.user.id, req.params.id, context || null, request_text || null);
  res.status(201).json({ id: info.lastInsertRowid, status: "pending" });
});

module.exports = router;
