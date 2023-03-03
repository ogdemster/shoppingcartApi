import express from "express";
import sql from "mssql";
import config from "../data/index.js";

const router = express.Router();

router.get("/shoppingitems", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM ShoppingItems");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/shoppingitems/:id", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM ShoppingItems WHERE id = @id");

    if (request.recordset.length === 0) {
      res.status(404).send("Shopping item not found");
    } else {
      res.json(request.recordset[0]);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/shoppingitems", async (req, res) => {
  try {
    const items = req.body;
    // const shoppingtractid = items[0].shoppingtractid;
    const shoppingtractid = 1;

    const pool = await sql.connect(config);
    const transaction = await pool.transaction();

    try {
      await transaction.begin();

      for (const item of items) {
        const { id, title, price, quantity } = item;

        const request = await transaction
          .request()
          .input("shoppingtractid", sql.Int, shoppingtractid)
          .input("item_id", sql.Int, id)
          .input("item_title", sql.VarChar, title)
          .input("item_price", sql.Decimal, price)
          .input("quantity", sql.Int, quantity)
          .query(
            `INSERT INTO ShoppingItems (shoppingtractid, item_id, item_title, item_price, quantity) 
            VALUES (@shoppingtractid, @item_id, @item_title, @item_price, @quantity);
            SELECT SCOPE_IDENTITY() AS id`
          );

        const id_ = request.recordset[0].id;
      }

      await transaction.commit();
      res.json({ success: true });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).send(error.message);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.put("/shoppingitems/:id", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("shoppingtractid", sql.Int, shoppingtractid)
      .input("item_id", sql.Int, item_id)
      .input("item_title", sql.NVarChar(50), item_title)
      .input("item_price", sql.Decimal(10, 2), item_price)
      .input("quantity", sql.Int, quantity)
      .query(
        `UPDATE ShoppingItems SET shoppingtractid = @shoppingtractid, item_id = @item_id, 
        item_title = @item_title, item_price = @item_price, quantity = @quantity 
        WHERE id = @id`
      );

    if (request.rowsAffected.length === 0) {
      res.status(404).send("Shopping item not found");
    } else {
      res.send("Shopping item updated successfully");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete("/shoppingitems/:id", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM ShoppingItems WHERE id = @id");

    if (request.rowsAffected.length === 0) {
      res.status(404).send("Shopping item not found");
    } else {
      res.send("Shopping item deleted successfully");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
