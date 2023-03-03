import express from "express";
import bodyParser from "body-parser";
import shoppingTract from "./routes/shoppingTract.js";
import shoppingitems from "./routes/shoppingItems.js";
import cors from "cors";

const app = express();

const port = 5000;

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", shoppingTract);
app.use("/", shoppingitems);

app.listen(port, () => {
  console.log(`Application started at: http://127.0.0.1:${port}`);
});
