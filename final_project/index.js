const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const authRoutes = require("./router/auth_users.js").authenticated;
const generalRoutes = require("./router/general.js").general;

const app = express();
const SECRET = process.env.SECRET || "kasdkjsh9uohr4jbkasnasd0sopi()D(Sjdls;l";

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function authenticateToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Missing Token" });
  }

  try {
    const splitToken = token.split(" ")[1].trim();

    const decoded = jwt.verify(splitToken, SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
});

const PORT = process.env.PORT || 5000;

app.use("/customer", authRoutes);
app.use("/", generalRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://127.0.0.1:${PORT}`)
);
