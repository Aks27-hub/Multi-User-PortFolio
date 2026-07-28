import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

// Load environment variables
const DB_HOST = process.env.DB_HOST || "";
const DB_USER = process.env.DB_USER || "";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "";
const DB_PORT = parseInt(process.env.DB_PORT || "3306", 10);

let pool = null;
const isMySQLConfigured = !!(DB_HOST && DB_USER && DB_NAME);

async function initializeMySQLSchema(mysqlPool) {
  try {
    const [rows] = await mysqlPool.query("SHOW TABLES");
    const tables = rows.map(row => Object.values(row)[0]);
    if (!tables.includes("users") || !tables.includes("profiles") || !tables.includes("projects") || !tables.includes("experiences")) {
      console.log("[Database] Some tables are missing in MySQL. Initializing from schema.sql...");
      const schemaPath = path.join(process.cwd(), "schema.sql");
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, "utf-8");
        const queries = schemaSql
          .split(";")
          .map(q => q.trim())
          .filter(q => q.length > 0 && !q.startsWith("--"));
        for (const q of queries) {
          await mysqlPool.query(q);
        }
        console.log("[Database] MySQL database tables initialized successfully!");
      } else {
        console.warn("[Database] schema.sql file not found at", schemaPath);
      }
    } else {
      console.log("[Database] All tables are already present in MySQL database.");
    }
  } catch (error) {
    console.error("[Database] Error checking/initializing MySQL database tables:", error);
  }
}

if (isMySQLConfigured) {
  try {
    console.log(`[Database] Connecting to MySQL at ${DB_HOST}:${DB_PORT}...`);
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
    // Run schema check asynchronously
    initializeMySQLSchema(pool).catch((err) => {
      console.error("[Database] Async schema initialization failure:", err);
    });
  } catch (error) {
    console.error("[Database] Failed to create MySQL pool, falling back to local JSON db:", error);
    pool = null;
  }
} else {
  console.log("[Database] MySQL environment variables not fully configured. Using robust local JSON database fallback.");
}

const LOCAL_DB_PATH = path.join(process.cwd(), "local-db.json");

function loadLocalDB() {
  const initial = { users: [], profiles: [], projects: [], experiences: [] };
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const data = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      const parsed = JSON.parse(data);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
      };
    }
  } catch (err) {
    console.error("[Database Fallback] Error reading local DB file, resetting:", err);
  }
  
  saveLocalDB(initial);
  return initial;
}

function saveLocalDB(data) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[Database Fallback] Error writing to local DB file:", err);
  }
}

/**
 * Executes a query. If MySQL is configured, runs on MySQL connection pool.
 * Otherwise, translates and executes the SQL queries on the local JSON fallback database.
 */
export async function query(sql, params = []) {
  if (isMySQLConfigured && pool) {
    try {
      return await pool.query(sql, params);
    } catch (err) {
      console.error("[Database] Real MySQL Query Error. Falling back to local DB processing:", err);
    }
  }

  // --- LOCAL FALLBACK DB IMPLEMENTATION ---
  const db = loadLocalDB();
  const sqlClean = sql.replace(/\s+/g, " ").trim();

  // 1. SELECT * FROM users WHERE username = ? OR email = ?
  if (sqlClean.includes("SELECT * FROM users WHERE") && (sqlClean.includes("username =") || sqlClean.includes("email ="))) {
    const users = db.users.filter(u => {
      if (params.length === 1) {
        return u.username === params[0] || u.email === params[0];
      } else if (params.length === 2) {
        return u.username === params[0] || u.email === params[1];
      }
      return false;
    });
    return [users, null];
  }

  // 2. INSERT INTO users (username, email, password_hash)
  if (sqlClean.includes("INSERT INTO users") && sqlClean.includes("password_hash")) {
    const newUser = {
      id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
      username: params[0],
      email: params[1],
      password_hash: params[2],
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    saveLocalDB(db);
    return [{ insertId: newUser.id }, null];
  }

  // 3. SELECT * FROM profiles WHERE user_id = ?
  if (sqlClean.includes("SELECT * FROM profiles WHERE user_id =")) {
    const userId = parseInt(params[0], 10);
    const profiles = db.profiles.filter(p => p.user_id === userId);
    return [profiles, null];
  }

  // 4. INSERT INTO profiles / ON DUPLICATE KEY UPDATE / REPLACE INTO profiles
  if (sqlClean.includes("INSERT INTO profiles") || sqlClean.includes("REPLACE INTO profiles")) {
    const userId = parseInt(params[0], 10);
    const existingIndex = db.profiles.findIndex(p => p.user_id === userId);
    
    const profileData = {
      id: existingIndex >= 0 ? db.profiles[existingIndex].id : (db.profiles.length > 0 ? Math.max(...db.profiles.map(p => p.id)) + 1 : 1),
      user_id: userId,
      full_name: params[1],
      title: params[2] || null,
      bio: params[3] || null,
      avatar_url: params[4] || null,
      github_url: params[5] || null,
      linkedin_url: params[6] || null,
      email_contact: params[7] || null,
      created_at: existingIndex >= 0 ? db.profiles[existingIndex].created_at : new Date().toISOString()
    };

    if (existingIndex >= 0) {
      db.profiles[existingIndex] = profileData;
    } else {
      db.profiles.push(profileData);
    }
    saveLocalDB(db);
    return [{ affectedRows: 1, insertId: profileData.id }, null];
  }

  // 5. SELECT * FROM projects WHERE user_id = ?
  if (sqlClean.includes("SELECT * FROM projects WHERE user_id =")) {
    const userId = parseInt(params[0], 10);
    const projects = db.projects.filter(p => p.user_id === userId);
    return [projects, null];
  }

  // 6. INSERT INTO projects (user_id, title, description, role, technologies, live_url, github_url)
  if (sqlClean.includes("INSERT INTO projects")) {
    const newProject = {
      id: db.projects.length > 0 ? Math.max(...db.projects.map(p => p.id)) + 1 : 1,
      user_id: parseInt(params[0], 10),
      title: params[1],
      description: params[2] || null,
      role: params[3] || null,
      technologies: params[4] || null,
      live_url: params[5] || null,
      github_url: params[6] || null,
      created_at: new Date().toISOString()
    };
    db.projects.push(newProject);
    saveLocalDB(db);
    return [{ insertId: newProject.id, affectedRows: 1 }, null];
  }

  // 7. DELETE FROM projects WHERE id = ? AND user_id = ?
  if (sqlClean.includes("DELETE FROM projects WHERE")) {
    const projectId = parseInt(params[0], 10);
    const userId = parseInt(params[1], 10);
    const beforeCount = db.projects.length;
    db.projects = db.projects.filter(p => !(p.id === projectId && p.user_id === userId));
    saveLocalDB(db);
    const affectedRows = beforeCount - db.projects.length;
    return [{ affectedRows }, null];
  }

  // 8. SELECT * FROM experiences WHERE user_id = ?
  if (sqlClean.includes("SELECT * FROM experiences WHERE user_id =")) {
    const userId = parseInt(params[0], 10);
    const experiences = db.experiences.filter(e => e.user_id === userId);
    return [experiences, null];
  }

  // 9. INSERT INTO experiences (user_id, company, role, start_date, end_date, description)
  if (sqlClean.includes("INSERT INTO experiences")) {
    const newExp = {
      id: db.experiences.length > 0 ? Math.max(...db.experiences.map(e => e.id)) + 1 : 1,
      user_id: parseInt(params[0], 10),
      company: params[1],
      role: params[2],
      start_date: params[3] || null,
      end_date: params[4] || null,
      description: params[5] || null,
      created_at: new Date().toISOString()
    };
    db.experiences.push(newExp);
    saveLocalDB(db);
    return [{ insertId: newExp.id, affectedRows: 1 }, null];
  }

  // 10. DELETE FROM experiences WHERE id = ? AND user_id = ?
  if (sqlClean.includes("DELETE FROM experiences WHERE")) {
    const expId = parseInt(params[0], 10);
    const userId = parseInt(params[1], 10);
    const beforeCount = db.experiences.length;
    db.experiences = db.experiences.filter(e => !(e.id === expId && e.user_id === userId));
    saveLocalDB(db);
    const affectedRows = beforeCount - db.experiences.length;
    return [{ affectedRows }, null];
  }

  // 11. PUBLIC PORTFOLIO: JOIN query or direct fetching of user & profile
  if (sqlClean.includes("FROM users u") && (sqlClean.includes("JOIN profiles") || sqlClean.includes("profiles p"))) {
    const username = params[0];
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return [[], null];
    }
    const profile = db.profiles.find(p => p.user_id === user.id);
    
    const joinedData = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: profile ? profile.full_name : user.username,
      title: profile ? profile.title : "Creative Professional",
      bio: profile ? profile.bio : "No bio provided yet.",
      avatar_url: profile ? profile.avatar_url : null,
      github_url: profile ? profile.github_url : null,
      linkedin_url: profile ? profile.linkedin_url : null,
      email_contact: profile ? profile.email_contact : user.email
    };
    return [[joinedData], null];
  }

  // 12. Generic user select by username
  if (sqlClean.includes("SELECT * FROM users WHERE username =")) {
    const username = params[0];
    const users = db.users.filter(u => u.username.toLowerCase() === username.toLowerCase());
    return [users, null];
  }

  console.warn(`[Database Fallback] Warning: SQL statement not explicitly mocked: "${sqlClean}". Returning empty array.`);
  return [[], null];
}

export default { query };
