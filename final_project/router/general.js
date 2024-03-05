const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const bcrypt = require("bcrypt");

// const hashPassword = async (password) => {
//   try {
//     if (password === undefined || password === null) {
//       throw new Error("Password is undefined or null");
//     }

//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password.toString(), saltRounds);
//     return hashedPassword;
//   } catch (error) {
//     console.error("Error hashing password:", error.message);
//     throw new Error("Error hashing password");
//   }
// };

public_users.post("/register", (req, res) => {
  const user = req.body;

  if (isValid(user)) {
    // validate if username already exists
    const existingUser = users.find((u) => u.username === user.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // validate if username or password not provided
    if (!user.username || !user.password) {
      return res
        .status(400)
        .json({ message: "Username or password not provided" });
    }

    try {
      // Hash or encrypt the password before storing it
      // user.password = hashPassword(user.password);

      users.push(user);
      return res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  return res.status(400).json({ message: "User already exists" });
});

function getAllBooks() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
      reject(new Error("Error fetching books"));
    }, 1000);
  });
}
// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await getAllBooks();
    res.status(200).json(allBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book details based on ISBN

function getBookDetails(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Invalid ISBN"));
      }
    }, 1000);
  });
}

public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  getBookDetails(isbn)
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(400).json({ message: err.message }));
  return;
});

// Get book details based on author
function getBookDetailsByAuthor(author) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = Object.values(books).find((book) => book.author === author);
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Invalid author"));
      }
    }, 1000);
  });
}

public_users.get("/author/:author", (req, res) => {
  const author = req.params.author;
  getBookDetailsByAuthor(author)
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(400).json({ message: err.message }));
  return;
});

// Get all books based on title
function getAllBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = Object.values(books).find((book) => book.title === title);
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Invalid title"));
      }
    }, 1000);
  });
}
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  getAllBooksByTitle(title)
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(400).json({ message: err.message }));
});

//  Get book review based on ISBN
public_users.get("/review/:isbn", function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = books[isbn];

    book && book.reviews
      ? res.status(200).json(book.reviews)
      : res.status(400).json({ message: "Invalid ISBN" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports.general = public_users;
