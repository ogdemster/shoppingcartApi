import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const router = express.Router();
const secretKey = "your-secret-key";

const excludedPaths = ["/auth2"];

router.use(cookieParser());
// const excludePath = ["/auth"];
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

/* HERE JWT STARTS */

// endpoint to generate a JWT token
router.post("/api/token", (req, res) => {
  const { username, password } = req.body;

  // validate the username and password
  if (username === "admin" && password === "admin") {
    // generate a JWT token

    const token = jwt.sign({ username }, secretKey);
    // set the cookie header
    // console.log(token);
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(("Access-Control-Allow-Headers", "Set-Cookie"));
    res.set("Set-Cookie", `jwt=${token}; HttpOnly; SameSite=None; Secure`);

    // return a success response
    res.status(200).json({ message: "Token generated successfully" });
  } else {
    // return an error response
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// middleware to verify the JWT token
export const verifyToken = (req, res, next) => {
  // check if the request path should be excluded from token verification
  // const excludedPaths = ["/login", "/signup", "/reset-password", "/"];
  const isExcluded = excludedPaths.some((path) => {
    if (path === "/" && req.path === path) {
      // if the excluded path is "/" and the request path is also "/", it's an exact match
      return true;
    }
    return req.path.startsWith(path);
  });

  if (isExcluded) {
    // if the path is excluded, skip token verification and move on to the next middleware
    return next();
  }

  // get the token from the cookie
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    // if there is no cookie header, the user is not authenticated
    return res.status(401).json({ message: "Unauthorized" });
  }

  // get the token from the cookie
  const token = req.headers.cookie.split("=")[1].split(";")[0];
  // verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: "Invalid token" });
    } else {
      // add the decoded username to the request object
      req.username = decoded.username;
      next();
    }
  });
};

export default router;
