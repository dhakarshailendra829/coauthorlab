const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Authenticated: submit an idea from the "Tell us your idea" flow
router.post("/", requireAuth, (req, res) => {
  const { raw_idea } = req.body || {};
  if (!raw_idea || !raw_idea.trim()) return res.status(400).json({ error: "raw_idea is required" });

  const info = db
    .prepare("INSERT INTO ideas (student_id, raw_idea) VALUES (?, ?)")
    .run(req.user.id, raw_idea.trim());
  res.status(201).json({ id: info.lastInsertRowid, status: "new" });
});

// Authenticated: list the current user's own ideas (their private workspace)
router.get("/mine", requireAuth, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM ideas WHERE student_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json(rows);
});

module.exports = router;
