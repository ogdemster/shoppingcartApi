import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import express from "express";
import sql from "mssql";
import config from "../data/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import moment from "moment";

const router = express.Router();

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

// router.post("/token", async (req, res) => {
//   const refreshToken = req.body.token;
//   if (refreshToken === null) {
//     return res.status(401).send("Unauthorized");
//   }

//   try {
//     const pool = await sql.connect(config);
//     const result = await pool
//       .request()
//       .query(
//         `select * from refresh_tokens where token='${refresh_tokens}' and expires_at > GETDATE()`
//       );
//     if (result.recordset.length === 0) {
//       return res.status(403).send();
//     }
//     const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     const accessToken = generateAccessToken(user);
//     res.json({ accessToken });
//   } catch (err) {
//     res.status(500).send();
//   }
// });

// function generateAccessToken(user) {
//   // console.log(user);
//   return jwt.sign(
//     { id: user.id, username: user.username },
//     process.env.MY_SUPER_SECRET_KEY,
//     {
//       algorithm: "HS256",
//     }
//   );
// }

// router.get("/verify", (req, res, next) => {
//   // authenticate(req, res, next);
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.sendStatus(401);
//   }
//   const token = authHeader.split(" ")[1];
//   // console.log(token);
//   try {
//     // Verify the JWT
//     const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, {
//       algorithm: ["HS256"],
//     });

//     const pool = sql.connect(config);
//     const result = pool
//       .request()
//       .query(
//         `select * from refresh_tokens where user_id=${user.id} and token='${token}'`
//       );

//     if (result.recordset.length > 0) {
//       return res.send("JWT is valid");
//     } else {
//       return res.sendStatus(401);
//     }
//   } catch (error) {
//     res.status(401).send("JWT is invalid");
//   }
// });

// // // Periodically clear out any expired refresh tokens from the database
// // setInterval(async () => {
// //   try {
// //     const pool = await sql.connect(config);
// //     await pool
// //       .request()
// //       .query(`delete from refresh_tokens where expiresAt < GETDATE()`);
// //   } catch (err) {
// //     console.error(err);
// //   }
// // }, process.env.REFRESH_TOKEN_EXPIRATION_TIME_IN_MINUTES * 60 * 1000);

// router.post("/login", async (req, res) => {
//   const pool = await sql.connect(config);
//   const result = await pool
//     .request()
//     .query(`select * from users where username='${req.body.username}'`);
//   if (result.recordset.length === 0) {
//     return res.status(404).send("User not found");
//   }
//   const user = result.recordset[0];
//   const password = req.body.password.toString();
//   if (!password || !(await bcrypt.compare(password, user.passwordhash))) {
//     return res.status(401).send("Invalid password");
//   }

//   // Check if the user already has a refresh token
//   const existingRefreshTokenResult = await pool
//     .request()
//     .query(
//       `select * from refresh_tokens where user_id=${user.id} and expires_at > cast(GETDATE() as smalldatetime)`
//     );

//   if (existingRefreshTokenResult.recordset.length > 0) {
//     // If the user already has a refresh token, return it along with a new access token
//     const existingRefreshToken = existingRefreshTokenResult.recordset[0].token;
//     jwt.verify(
//       existingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET,
//       (err, decoded) => {
//         if (err) {
//           return res.status(403).send();
//         }

//         const accessToken = generateAccessToken(decoded);
//         return res.json({ accessToken, refreshToken: existingRefreshToken });
//       }
//     );
//   } else {
//     // If the user doesn't have a refresh token, create a new one and return it along with a new access token
//     const refreshToken = jwt.sign(
//       { id: user.id, username: user.username },
//       process.env.REFRESH_TOKEN_SECRET,
//       { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRATION_TIME_IN_MINUTES}m` }
//     );
//     const expiresAt = moment()
//       .add(process.env.REFRESH_TOKEN_EXPIRATION_TIME_IN_MINUTES, "minutes")
//       .format("YYYY-MM-DD HH:mm:ss.SSS");
//     await pool
//       .request()
//       .query(
//         `insert into refresh_tokens (user_id, token, expires_at) values (${user.id}, '${refreshToken}', '${expiresAt}')`
//       );
//     const accessToken = generateAccessToken({ id: user.id });
//     return res.json({ accessToken, refreshToken });
//   }
// });

// // Endpoint for refreshing access token using refresh token
// router.post("/refresh", async (req, res) => {
//   const refreshToken = req.body.token;
//   if (refreshToken == null)
//     return res.status(401).json({ error: "Unauthorized" });
//   try {
//     const result = await db.query(
//       "SELECT * FROM RefreshTokens WHERE Token = @token",
//       {
//         token: refreshToken,
//       }
//     );
//     if (result.recordset.length === 0)
//       return res.status(403).json({ error: "Forbidden" });
//     jwt.verify(
//       refreshToken,
//       process.env.REFRESH_TOKEN_SECRET,
//       async (err, user) => {
//         if (err) return res.status(403).json({ error: "Forbidden" });
//         const accessToken = generateAccessToken(user);
//         return res.json({ accessToken });
//       }
//     );
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// router.post("/register", async (req, res) => {
//   const { username, password, email } = req.body;

//   // Hash the password using bcrypt
//   const saltRounds = 10;
//   const hashedPassword = await bcrypt.hash(password, saltRounds);
//   // Insert the user's information into the database

//   const userExists = await sql.connect(config);
//   const result = await userExists
//     .request()
//     .query(`select * from users where username='${username}'`);

//   if (result.recordset.length > 0) {
//     return res.send("User already exists");
//   } else {
//     const pool = await sql.connect(config);
//     await pool
//       .request()
//       .query(
//         `insert into users (username, passwordHash, email) values ('${username}', '${hashedPassword}', '${email}')`
//       );
//     // Redirect the user to the login page
//   }
// });

// router.post("/logout", (req, res) => {
//   if (!req.headers.hasOwnProperty("authorization")) {
//     return res.status(401).send("Missing authorization header");
//   }
//   jwt.verify(
//     req.headers.authorization.split(" ")[1],
//     process.env.REFRESH_TOKEN_SECRET,
//     async (err, user) => {
//       if (err) {
//         return res.sendStatus(401).send("Invalid JWT");
//       }
//       const pool = await sql.connect(config);
//       await pool
//         .request()
//         .query(
//           `delete from refresh_tokens where user_id=${user.id} and token='${
//             req.headers.authorization.split(" ")[1]
//           }'`
//         );
//       res.sendStatus(200);
//     }
//   );
// });

// export const verifyJwt = async (req, res, next) => {
//   if (
//     excludePath.some((path) => req.path.startsWith(path) || req.path === "/")
//   ) {
//     next();
//   } else {
//     // Get the JWT from the request header
//     const token = req.headers.authorization;
//     // console.log(req);
//     // Make a request to the auth server to verify the JWT
//     try {
//       const response = await axios.get(`${authServer}/verify`, {
//         headers: { authorization: token },
//       });
//       // If the JWT is valid, call the next middleware function
//       next();
//     } catch (error) {
//       // If the JWT is invalid, return an error response
//       // console.log(error.response.data);
//       res.status(401).send("Unauthorized");
//     }
//   }
// };

export default router;
