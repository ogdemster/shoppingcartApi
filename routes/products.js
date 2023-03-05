import express from "express";
import sql from "mssql";
import config from "../data/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM Products");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPercentage,
      rating,
      stock,
      brand,
      category,
      thumbnail,
      images,
    } = req.body;
    const pool = await sql.connect(config);
    const transaction = await pool.transaction();

    try {
      await transaction.begin();

      const request = await transaction
        .request()
        .input("title", sql.VarChar, title) // add user_id input
        .input("description", sql.VarChar, description)
        .input("price", sql.Decimal, price)
        .input("discountPercentage", sql.Decimal, discountPercentage)
        .input("rating", sql.Decimal, rating)
        .input("stock", sql.Decimal, stock)
        .input("brand", sql.VarChar, brand)
        .input("category", sql.VarChar, category)
        .input("thumbnail", sql.VarChar, thumbnail)
        .input("images", sql.VarChar, images)
        .query(
          `insert into Products (title, description, price, discountPercentage, rating, stock, brand, category, thumbnail, images) 
          VALUES (@title, @description, @price, @discountPercentage, @rating, @stock, @brand, @category, @thumbnail, @images );
          SELECT SCOPE_IDENTITY() AS id`
        );

      await transaction.commit();
      res.json({ success: true });
    } catch (error) {
      await transaction.rollback();
      res.status(500).send(error.message);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPercentage,
      rating,
      stock,
      brand,
      category,
      thumbnail,
      images,
    } = req.body;

    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("title", sql.VarChar, title) // add user_id input
      .input("description", sql.VarChar, description)
      .input("price", sql.Decimal, price)
      .input("discountPercentage", sql.Decimal, discountPercentage)
      .input("rating", sql.Decimal, rating)
      .input("stock", sql.Decimal, stock)
      .input("brand", sql.VarChar, brand)
      .input("category", sql.VarChar, category)
      .input("thumbnail", sql.VarChar, thumbnail)
      .input("images", sql.VarChar, images)
      .input("id", sql.Int, req.params.id)
      .query(
        `UPDATE Products SET title = @title, description = @description, 
        price = @price, discountPercentage=@discountPercentage, rating=@rating, 
        stock=@stock, brand=@brand, category=@category, thumbnail=@thumbnail, images=@images 
        WHERE id = @id`
      );
    if (request.rowsAffected.length === 0) {
      res.status(404).send("Product not found");
    } else {
      res.send("Product updated successfully");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    //add sold once already check
    const pool = await sql.connect(config);
    const request = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Products WHERE id = @id");

    if (request.rowsAffected.length === 0) {
      res.status(404).send("Product not found");
    } else {
      res.send("Product deleted successfully");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
