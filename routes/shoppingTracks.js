import express from "express";
import sql from "mssql";
import config from "../data/index.js";

const router = express.Router();

router.get("/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id.split("=")[1];
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query(`SELECT * FROM ShoppingTracks where user_id=${user_id}`);
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
      .query("SELECT * FROM ShoppingTracks WHERE id = @id");

    if (request.recordset.length === 0) {
      res.status(404).send("Shopping track not found");
    } else {
      res.json(request.recordset[0]);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const { user_id, date, total_price } = req.body;
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("date", sql.Date, date)
      .input("user_id", sql.VarChar, user_id)
      .input("total_price", sql.decimal, total_price)
      .query(
        "INSERT INTO ShoppingTracks (user_id, date, total_price) VALUES (@user_id, @date, @total_price); SELECT SCOPE_IDENTITY() AS id"
      );

    const id = request.recordset[0].id;
    res.json({ id, date });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { total_price } = req.body;
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("total_price", sql.decimal, total_price)
      .query(
        "UPDATE ShoppingTracks SET total_price = @total_price WHERE id = @id"
      );

    if (request.rowsAffected.length === 0) {
      res.status(404).send("Shopping track not found");
    } else {
      res.send("Shopping track updated successfully");
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
      .query("DELETE FROM ShoppingTracks WHERE id = @id");

    if (request.rowsAffected.length === 0) {
      res.status(404).send("Shopping track not found");
    } else {
      res.send("Shopping track deleted successfully");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
