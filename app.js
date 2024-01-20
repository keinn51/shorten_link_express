const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const mysql = require("mysql");
const path = require("path");

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

function getAllLinks(callback) {
  connection.query(`SELECT * FROM shortenlink.link;`, (err, rows, fields) => {
    if (err) throw err;
    callback(rows);
  });
}

// 루트 경로에 대한 핸들러
app.get("/", (req, res) => {
  // res.send("안녕하세요, Express 서버입니다!");
  res.render("index.ejs");
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

app.get("/test", function (req, res, next) {
  getAllLinks((rows) => {
    console.log(rows);
  });
});
