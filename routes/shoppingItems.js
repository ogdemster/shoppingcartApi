import express from "express";
import sql from "mssql";
import config from "../data/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM ShoppingItems");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/:userid", async (req, res) => {
  try {
    const userid = req.params.userid;

    const pool = await sql.connect(config);
    const request = await pool.request().input("id", sql.Int, req.params.id)
      .query(`select shoppingtractid, user_id, date, total_price, b.id, item_id,item_title, 
      item_price,quantity from ShoppingTracks a inner join ShoppingItems b on a.id=b.shoppingtractid where user_id=${userid}`);

    if (request.recordset.length === 0) {
      res.status(404).send("Shopping item not found");
    } else {
      res.json(request.recordset);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const { cartItems, userId } = req.body;
    const pool = await sql.connect(config);
    const transaction = await pool.transaction();

    try {
      await transaction.begin();

      const request = await transaction
        .request()
        .input("user_id", sql.Int, userId) // add user_id input
        .input(
          "total_price",
          sql.Decimal,
          cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          )
        ) // calculate total_price
        .query(
          `INSERT INTO ShoppingTracks (user_id, total_price,date) 
          VALUES (@user_id, @total_price, GETDATE());
          SELECT SCOPE_IDENTITY() AS id`
        );

      const shoppingtrackid = request.recordset[0].id;

      for (const item of cartItems) {
        const { id, title, price, quantity } = item;

        const request = await transaction
          .request()
          .input("shoppingtractid", sql.Int, shoppingtrackid)
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

router.put("/:id", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
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
