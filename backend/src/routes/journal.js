const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Public: published posts only
router.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT j.id, j.post_type, j.title, j.summary, j.tags, j.doi_or_link, j.created_at, u.name AS author
       FROM journal_posts j JOIN users u ON u.id = j.author_id
       WHERE j.status = 'published'
       ORDER BY j.created_at DESC`
    )
    .all();
  res.json(rows);
});

// Admin only: create and immediately publish a post
router.post("/", requireAuth, requireRole("admin"), (req, res) => {
  const { post_type, title, summary, tags, doi_or_link } = req.body || {};
  if (!post_type || !title) return res.status(400).json({ error: "post_type and title are required" });

  const info = db
    .prepare(
      `INSERT INTO journal_posts (author_id, post_type, title, summary, tags, doi_or_link, status)
       VALUES (?, ?, ?, ?, ?, ?, 'published')`
    )
    .run(req.user.id, post_type, title, summary || null, tags || null, doi_or_link || null);
  res.status(201).json({ id: info.lastInsertRowid, status: "published" });
});

// Authenticated: author submits their own draft for review
router.post("/:id/submit", requireAuth, (req, res) => {
  const post = db.prepare("SELECT * FROM journal_posts WHERE id = ?").get(req.params.id);
  if (!post || post.author_id !== req.user.id) return res.status(404).json({ error: "Post not found" });
  db.prepare("UPDATE journal_posts SET status = 'in_review' WHERE id = ?").run(req.params.id);
  res.json({ ok: true, status: "in_review" });
});

// Admin: list posts awaiting review
router.get("/pending", requireAuth, requireRole("admin"), (req, res) => {
  const rows = db
    .prepare(
      `SELECT j.id, j.post_type, j.title, j.summary, j.created_at, u.name AS author
       FROM journal_posts j JOIN users u ON u.id = j.author_id
       WHERE j.status = 'in_review'
       ORDER BY j.created_at DESC`
    )
    .all();
  res.json(rows);
});

// Admin: publish or reject a submitted post
router.post("/:id/moderate", requireAuth, requireRole("admin"), (req, res) => {
  const { decision } = req.body || {}; // "published" | "rejected"
  if (!["published", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "decision must be 'published' or 'rejected'" });
  }
  db.prepare("UPDATE journal_posts SET status = ? WHERE id = ?").run(decision, req.params.id);
  res.json({ ok: true, status: decision });
});

module.exports = router;
