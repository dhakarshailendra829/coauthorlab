require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const mentorRoutes = require("./routes/mentors");
const journalRoutes = require("./routes/journal");
const ideaRoutes = require("./routes/ideas");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, service: "coauthorlab-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/ideas", ideaRoutes);

// Optionally serve the frontend from this same service (single-deploy mode).
// Set SERVE_FRONTEND=true and FRONTEND_DIR to the frontend folder path.
if (process.env.SERVE_FRONTEND === "true") {
  const frontendDir = path.resolve(process.env.FRONTEND_DIR || path.join(__dirname, "..", "..", "frontend"));
  app.use(
    express.static(frontendDir, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    })
  );
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.join(frontendDir, "index.html"));
  });
}

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`CoAuthorLab API running on port ${PORT}`));

