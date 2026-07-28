### How to run this application:

Prerequisites

Node.js: Ensure Node.js (version 18 or newer) is installed on your computer. You can verify this by running node -v in your terminal.

Optional — MySQL Server: If you want to use a real MySQL database. If omitted, the application will automatically fall back to a built-in local database (local-db.json), so MySQL is not strictly required to test or run the app.

## Step 1: Extract and Navigate to Project Directory

Unzip the downloaded file onto your computer.

Open your terminal (or Command Prompt / PowerShell) and change directory to the unzipped project folder:

```
bash
cd path/to/unzipped-portfolio-builder
```

## Step 2: Install Dependencies
Install all necessary packages (Express, React, Vite, Tailwind, JWT, bcrypt, mysql2, etc.) by running:

```
bash
npm install
```

## Step 3: Set Up Environment Variables (Optional)

Create a .env file in the root directory if you want to connect to a live MySQL database or customize your JWT secret key:

```
Env

# Server Configuration

PORT=3000

JWT_SECRET=super_secret_jwt_portfolio_builder_key_2026

# MySQL Connection (Optional — leave empty to use local JSON database)

DB_HOST=localhost

DB_PORT=3306

DB_USER=root

DB_PASSWORD=your_mysql_password

DB_NAME=portfolio_builder
```

Note: If DB_HOST, DB_USER, and DB_NAME are omitted, the application will automatically create and use a local database file (local-db.json) in the project root.

## Step 4: Run the Application

Runs the Node.js Express server with live Vite middleware integration:

```
bash
npm run dev
```

Open your web browser and navigate to the url generater
