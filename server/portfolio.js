import express from "express";
import { authenticateToken } from "./auth.js";
import { query } from "./db.js";

const router = express.Router();

/**
 * Fetch profile of the logged-in user
 * GET /api/portfolio/profile
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [profiles] = await query("SELECT * FROM profiles WHERE user_id = ? LIMIT 1", [userId]);
    
    if (!profiles || profiles.length === 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.status(200).json(profiles[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Server error fetching profile" });
  }
}

/**
 * Create or update (upsert) profile of the logged-in user
 * POST /api/portfolio/profile
 */
export async function upsertProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { full_name, title, bio, avatar_url, github_url, linkedin_url, email_contact } = req.body;

    if (!full_name) {
      res.status(400).json({ error: "Full name is required" });
      return;
    }

    const upsertSql = `
      INSERT INTO profiles (user_id, full_name, title, bio, avatar_url, github_url, linkedin_url, email_contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        title = VALUES(title),
        bio = VALUES(bio),
        avatar_url = VALUES(avatar_url),
        github_url = VALUES(github_url),
        linkedin_url = VALUES(linkedin_url),
        email_contact = VALUES(email_contact)
    `;

    await query(upsertSql, [
      userId,
      full_name,
      title || null,
      bio || null,
      avatar_url || null,
      github_url || null,
      linkedin_url || null,
      email_contact || null
    ]);

    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error("Error upserting profile:", err);
    res.status(500).json({ error: "Server error updating profile" });
  }
}

/**
 * Fetch all projects for the logged-in user
 * GET /api/portfolio/projects
 */
export async function getProjects(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [projects] = await query("SELECT * FROM projects WHERE user_id = ? ORDER BY id DESC", [userId]);
    res.status(200).json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Server error fetching projects" });
  }
}

/**
 * Create a new project for the logged-in user
 * POST /api/portfolio/projects
 */
export async function createProject(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { title, description, role, technologies, live_url, github_url } = req.body;

    if (!title) {
      res.status(400).json({ error: "Project title is required" });
      return;
    }

    const insertSql = `
      INSERT INTO projects (user_id, title, description, role, technologies, live_url, github_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await query(insertSql, [
      userId,
      title,
      description || null,
      role || null,
      technologies || null,
      live_url || null,
      github_url || null
    ]);

    res.status(201).json({
      message: "Project created successfully!",
      projectId: result.insertId
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ error: "Server error creating project" });
  }
}

/**
 * Delete a project for the logged-in user
 * DELETE /api/portfolio/projects/:id
 */
export async function deleteProject(req, res) {
  try {
    const userId = req.user?.id;
    const projectId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const deleteSql = "DELETE FROM projects WHERE id = ? AND user_id = ?";
    const [result] = await query(deleteSql, [projectId, userId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Project not found or not owned by you" });
      return;
    }

    res.status(200).json({ message: "Project deleted successfully!" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Server error deleting project" });
  }
}

/**
 * Fetch all work experiences for the logged-in user
 * GET /api/portfolio/experiences
 */
export async function getExperiences(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [experiences] = await query("SELECT * FROM experiences WHERE user_id = ? ORDER BY id DESC", [userId]);
    res.status(200).json(experiences);
  } catch (err) {
    console.error("Error fetching experiences:", err);
    res.status(500).json({ error: "Server error fetching experiences" });
  }
}

/**
 * Create a new experience for the logged-in user
 * POST /api/portfolio/experiences
 */
export async function createExperience(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { company, role, start_date, end_date, description } = req.body;

    if (!company || !role) {
      res.status(400).json({ error: "Company and Role are required" });
      return;
    }

    const insertSql = `
      INSERT INTO experiences (user_id, company, role, start_date, end_date, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await query(insertSql, [
      userId,
      company,
      role,
      start_date || null,
      end_date || null,
      description || null
    ]);

    res.status(201).json({
      message: "Experience logged successfully!",
      experienceId: result.insertId
    });
  } catch (err) {
    console.error("Error creating experience:", err);
    res.status(500).json({ error: "Server error creating experience" });
  }
}

/**
 * Delete an experience for the logged-in user
 * DELETE /api/portfolio/experiences/:id
 */
export async function deleteExperience(req, res) {
  try {
    const userId = req.user?.id;
    const expId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const deleteSql = "DELETE FROM experiences WHERE id = ? AND user_id = ?";
    const [result] = await query(deleteSql, [expId, userId]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Experience not found or not owned by you" });
      return;
    }

    res.status(200).json({ message: "Experience deleted successfully!" });
  } catch (err) {
    console.error("Error deleting experience:", err);
    res.status(500).json({ error: "Server error deleting experience" });
  }
}

/**
 * Public endpoint: Fetches all profile, project, and experience data for a specific username.
 * GET /api/:username
 */
export async function getPublicPortfolio(req, res) {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ error: "Username parameter is required" });
      return;
    }

    const profileJoinSql = `
      SELECT u.id, u.username, u.email,
             p.full_name, p.title, p.bio, p.avatar_url, p.github_url, p.linkedin_url, p.email_contact
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.username = ?
      LIMIT 1
    `;

    const [userRows] = await query(profileJoinSql, [username]);

    if (!userRows || userRows.length === 0) {
      res.status(404).json({ error: `User with username "${username}" not found` });
      return;
    }

    const userProfile = userRows[0];
    const userId = userProfile.id;

    const [projects] = await query("SELECT id, title, description, role, technologies, live_url, github_url FROM projects WHERE user_id = ? ORDER BY id DESC", [userId]);
    const [experiences] = await query("SELECT id, company, role, start_date, end_date, description FROM experiences WHERE user_id = ? ORDER BY id DESC", [userId]);

    res.status(200).json({
      profile: {
        username: userProfile.username,
        email: userProfile.email,
        full_name: userProfile.full_name || userProfile.username,
        title: userProfile.title || "Independent Developer",
        bio: userProfile.bio || "No biography provided yet.",
        avatar_url: userProfile.avatar_url || null,
        github_url: userProfile.github_url || null,
        linkedin_url: userProfile.linkedin_url || null,
        email_contact: userProfile.email_contact || userProfile.email
      },
      projects: projects || [],
      experiences: experiences || []
    });
  } catch (err) {
    console.error(`Error fetching public portfolio for ${req.params.username}:`, err);
    res.status(500).json({ error: "Server error fetching public portfolio details" });
  }
}

router.get("/profile", authenticateToken, getProfile);
router.post("/profile", authenticateToken, upsertProfile);
router.get("/projects", authenticateToken, getProjects);
router.post("/projects", authenticateToken, createProject);
router.delete("/projects/:id", authenticateToken, deleteProject);
router.get("/experiences", authenticateToken, getExperiences);
router.post("/experiences", authenticateToken, createExperience);
router.delete("/experiences/:id", authenticateToken, deleteExperience);
router.get("/:username", getPublicPortfolio);

export default router;
