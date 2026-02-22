import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("database.sqlite");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    is_premium INTEGER DEFAULT 0,
    scan_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    title TEXT,
    company TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    notes TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Mock Auth Middleware (for demo purposes, in a real app use JWT/Sessions)
  // We'll simplify for the prototype but keep it functional
  
  app.post("/api/auth/register", (req, res) => {
    const { email, password } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, password);
      res.json({ id: info.lastInsertRowid, email, is_premium: 0, scan_count: 0 });
    } catch (e) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/cards", (req, res) => {
    const userId = req.query.userId;
    const cards = db.prepare("SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    res.json(cards);
  });

  app.post("/api/cards", (req, res) => {
    const { user_id, name, title, company, email, phone, website, address, notes, image_url } = req.body;
    
    // Check scan limit
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
    if (!user.is_premium && user.scan_count >= 5) {
      return res.status(403).json({ error: "Scan limit reached. Please upgrade to premium." });
    }

    const info = db.prepare(`
      INSERT INTO cards (user_id, name, title, company, email, phone, website, address, notes, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, name, title, company, email, phone, website, address, notes, image_url);

    // Update scan count
    db.prepare("UPDATE users SET scan_count = scan_count + 1 WHERE id = ?").run(user_id);

    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/cards/:id", (req, res) => {
    const { id } = req.params;
    const { name, title, company, email, phone, website, address, notes } = req.body;
    db.prepare(`
      UPDATE cards 
      SET name = ?, title = ?, company = ?, email = ?, phone = ?, website = ?, address = ?, notes = ?
      WHERE id = ?
    `).run(name, title, company, email, phone, website, address, notes, id);
    res.json({ success: true });
  });

  app.post("/api/subscribe", (req, res) => {
    const { userId } = req.body;
    db.prepare("UPDATE users SET is_premium = 1 WHERE id = ?").run(userId);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
