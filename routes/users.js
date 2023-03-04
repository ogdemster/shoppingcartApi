import express from "express";
import sql from "mssql";
import config from "../data/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT username FROM Users");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM users WHERE id = @id");

    if (request.recordset.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.json(request.recordset[0]);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password).query(`
          IF NOT EXISTS (SELECT * FROM users WHERE username = @username)
          BEGIN
              INSERT INTO users (username, password) VALUES (@username, @password);
              SELECT SCOPE_IDENTITY() AS id, 1 AS isNewUser;
          END
          ELSE
          BEGIN
              SELECT id, 0 AS isNewUser FROM users WHERE username = @username;
          END
      `);
    const id = request.recordset[0].id;
    const isNewUser = request.recordset[0].isNewUser === 1;
    res.json({ id, isNewUser });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .query("UPDATE users SET total_price = @total_price WHERE id = @id");

    if (request.rowsAffected.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send("User updated successfully");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM users WHERE id = @id");

    if (request.rowsAffected.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send("User deleted successfully");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
