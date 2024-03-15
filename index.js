const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const path = require("path");

app.use(bodyParser.json());
let books = [];

app.post("/books", (req, res) => {
  try {
    const { book } = req.body;
    if (!book) {
      throw new Error("Book title is required.");
    }
    if (books.includes(book)) {
      throw new Error("Book already exists in the library.");
    }
    books.push(book);
    console.log(books);
    res.status(201).json({ message: "Book added successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/books", (req, res) => {
  try {
    const { book } = req.body;
    const index = books.indexOf(book);
    if (index === -1) {
      throw new Error("Book not found in the library.");
    }
    books.splice(index, 1);
    res.json({ message: "Book removed successfully." });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.patch("/books", (req, res) => {
  try {
    const { original_book, new_book } = req.body;
    const index = books.indexOf(original_book);
    if (index === -1) {
      throw new Error("Book not found in the library.");
    }
    if (books.includes(new_book)) {
      throw new Error("New book name already exists in the library.");
    }
    books[index] = new_book;
    res.json({ message: "Book name updated successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET method to return the full contents of the library
function getBookList(bookList, index, callback) {
  if (index === books.length) {
    callback(bookList);
    return;
  }
  setTimeout(()=>{
    const bookTitle = `${books[index]}`;
    bookList = bookList + bookTitle + ", ";
    getBookList(bookList, index + 1, callback);
  },500);
}

app.get("/books", (req, res) => {
  try {
    let stBook = "";
    let callback = (bookList) => {
        res.send(bookList);
    };
   getBookList(stBook, 0, callback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT method to simulate asynchronous persistence
function saveItemOnDatabase(book, handleCallback) {
  const interval = setInterval(() => {
    clearInterval(interval);
    const delay = Math.random() * book.length;
    const filePath = path.join(__dirname, "Books", `${book}.txt`);
    fs.writeFile(filePath, `Book: ${book}`, (err) => {
      if (err) {
        console.error(`Error writing file for ${book}:`, err);
        handleCallback(book, -1);
      } else {
        console.log(`Book ${book} saved successfully!`);
        handleCallback(book, delay);
      }
    });
  }, Math.random() * 1000);
}

app.put("/books", (req, res) => {
  try {
    const response = {};
    let count = 0;

    const handleCallback = (book, delay) => {
      response[book] = delay;
      count++;
      if (count === books.length) {
        res.json(response);
      }
    };

    for (const book of books) {
      saveItemOnDatabase(book, handleCallback);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = 3002;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
