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

function getOriginalLink(newLink) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM shortenlink.link WHERE newLink='${newLink}' LIMIT 1`,
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.length === 0) {
            resolve(null);
            return;
          }
          resolve(results[0].originalLink);
        }
      }
    );
  });
}

// 루트 경로에 대한 핸들러
app.get("/", (req, res) => {
  res.render("index.ejs", { message: "" });
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

// submit시 실행 함수
app.post("/", async (req, res) => {
  const originalLink = req.body.originalLink;
  let newLink = generateRandomId(6);

  try {
    let preExistingNewLink = await getOriginalLink(newLink);
    while (preExistingNewLink !== null) {
      newLink = generateRandomId(6);
      preExistingNewLink = await getOriginalLink(newLink);
    }
  } catch (err) {
    console.error(err);
    res.render("index.ejs", {
      message: "서버에서 오류가 발생했습니다. 죄송합니다.",
    });
    return;
  }

  connection.query(
    "INSERT INTO shortenlink.link (originalLink, newLink) VALUES (?, ?)",
    [originalLink, newLink],
    (error, results) => {
      if (error) {
        console.error(error);
        return;
      }
      res.send("쿼리문이 실행되었습니다.");
    }
  );
});

// 리다이렉트
app.get("/:newLink", async (req, res) => {
  const newLink = req.params.newLink;

  if (newLink === "404.ejs") {
    return;
  }

  try {
    const originalLink = await getOriginalLink(newLink);

    if (originalLink === null) {
      res.render("404.ejs");
      return;
    }

    res.redirect(originalLink);
  } catch (err) {
    console.error(err);
    res.render("404.ejs");
    return;
  }
});
