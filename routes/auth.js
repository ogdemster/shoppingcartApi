import express from "express";
import sql from "mssql";
import config from "../data/index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query(
        `select id,username from users where username='${username}' and password='${password}'`
      );
    if (request.recordset.length > 0) {
      res.status(200).send(request.recordset);
    } else {
      res.status(200).send("User not found");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
