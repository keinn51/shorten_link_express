const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");

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

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function generateRandomId(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
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

// submit시 실행 함수
app.post("/", (req, res) => {
  const originalLink = req.body.originalLink;
  const newLink = generateRandomId(6);
  const query =
    "INSERT INTO shortenlink.link (originalLink, newLink) VALUES (?, ?)";
  connection.query(query, [originalLink, newLink], (error, results) => {
    if (error) throw error;
    res.send("쿼리문이 실행되었습니다.");
  });
});

// 리다이렉트
app.get("/:newLink", (req, res) => {
  const newLink = req.params.newLink;
  connection.query(
    `SELECT * FROM shortenlink.link WHERE newLink='${newLink}' LIMIT 1`,
    (err, rows, fields) => {
      if (err) throw err;
      // console.log(rows[0].originalLink);
      res.redirect(rows[0].originalLink); // /old-url로 접속 시 /new-url로 리다이렉트
    }
  );
});
