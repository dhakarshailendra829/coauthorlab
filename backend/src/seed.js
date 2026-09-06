// seed.js — populates the database with an admin account, a verified mentor,
// and a published journal post so the site isn't empty on first run.
// Usage: node src/seed.js
const bcrypt = require("bcryptjs");
const db = require("./db");

function upsertUser({ name, email, password, role, bio }) {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return existing.id;
  const password_hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, email, password_hash, role, bio) VALUES (?, ?, ?, ?, ?)")
    .run(name, email, password_hash, role, bio || null);
  return info.lastInsertRowid;
}

const adminId = upsertUser({
  name: "Shailendra Dhakad",
  email: "admin@coauthorlab.com",
  password: "ChangeMe123!",
  role: "admin",
  bio: "Founder & CEO, CoAuthorLab. Researcher, Autonomous Systems & Robotics.",
});

const mentorUserId = upsertUser({
  name: "Shailendra Dhakad",
  email: "mentor@coauthorlab.com",
  password: "MentorDemo123!",
  role: "mentor",
  bio: "Founder, CoAuthorLab. Researcher, Autonomous Systems & Robotics.",
});

const existingMentor = db.prepare("SELECT id FROM mentors WHERE user_id = ?").get(mentorUserId);
if (!existingMentor) {
  db.prepare(
    `INSERT INTO mentors (user_id, institution, expertise, degrees, links, mentoring_formats, verification_status)
     VALUES (?, ?, ?, ?, ?, ?, 'verified')`
  ).run(
    mentorUserId,
    "CoAuthorLab",
    "Autonomous Systems, Robotics",
    null,
    JSON.stringify({ email: "coauthorlab@gmail.com" }),
    "Written feedback, one-off session"
  );
}

const existingPost = db.prepare("SELECT id FROM journal_posts WHERE title = ?").get(
  "Welcome to CoAuthorLab's Research Journal"
);
if (!existingPost) {
  db.prepare(
    `INSERT INTO journal_posts (author_id, post_type, title, summary, tags, status)
     VALUES (?, 'expert_article', ?, ?, 'welcome, community', 'published')`
  ).run(
    adminId,
    "Welcome to CoAuthorLab's Research Journal",
    "A calm, structured place to share project notes, publications and opportunities."
  );
}

console.log("Seed complete.");
console.log("Admin login: admin@coauthorlab.com / ChangeMe123!  (change this immediately)");
console.log("Demo mentor login: mentor@coauthorlab.com / MentorDemo123!");
