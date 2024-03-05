const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const SECRET = process.env.SECRET || "kasdkjsh9uohr4jbkasnasd0sopi()D(Sjdls;l";

const isValid = (username) => {
  //returns boolean
  // write code to check is the username is valid
  if (users.includes(username)) {
    return false;
  } else {
    return true;
  }
};

const authenticatedUser = (username, password) => {
  // Returns boolean
  // Checks if username and password match the one in records
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Only registered users can login
  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  try {
    const token = jwt.sign({ username }, SECRET);
    return res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.user.username;

    if (!username) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not logged in" });
    }

    const usernameMatch = users.some((user) => user.username === username);

    if (!usernameMatch) {
      return res.status(401).json({ message: "Unauthorized - User not valid" });
    }

    const book = books[isbn];

    if (book) {
      book.reviews = book.reviews || {};

      book.reviews[username] = review;

      return res.status(200).json({ message: "Review added successfully" });
    } else {
      return res.status(400).json({ message: "Invalid ISBN" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!username) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not logged in" });
    }

    const book = books[isbn];

    if (book) {
      if (book.reviews && book.reviews[username]) {
        delete book.reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
      } else {
        return res.status(400).json({ message: "Review not found" });
      }
    } else {
      return res.status(400).json({ message: "Invalid ISBN" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
