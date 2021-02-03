const sqlite3 = require("sqlite3").verbose();
const path = require("path");
let db;

const filesTable = `CREATE TABLE IF NOT EXISTS files (
    file text NOT NULL,
    checkedSig integer NOT NULL,
    complete integer NOT NULL 
);`;

const database = {
  init,
  save,
  incomplete,
  findByName,
};

function init() {
  const dbPath = path.resolve(__dirname, "./database/pic2drive.db");
  try {
    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);
    db.run(filesTable);
    console.log("Connected to SQlite database.");
  } catch (err) {
    console.log(err);
  }
}

async function save(file) {
  db.serialize(function () {
    db.run(
      "INSERT INTO files (file,checkedSig,complete) VALUES (?,?,?)",
      [`${file}`, 0, 0],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      }
    );
  });
}

async function incomplete() {
  db.all("SELECT * FROM files WHERE complete='0'", function (err, rows) {
    if (err) console.log(err.message);
    if (rows.length > 0) {
      rows.forEach(function (row) {
        console.log("row :>> ", row);
      });
    } else {
      console.log("no match");
    }
  });

  return rows;
}

function findByName(filename) {
  const query = `SELECT * FROM files WHERE file='${filename}'`;
  return new Promise((resolve, reject) => {
    db.all(query, function (err, rows) {
      if (err) reject(err.message);
      if (rows) {
        rows.forEach(function (row) {
          console.log("row :>> ", row);
        });
        resolve(rows);
      } else {
        resolve([]);
      }
    });
  });
}

async function cleanup() {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Close the database connection.");
  });
}

module.exports = database;
