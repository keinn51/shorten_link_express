require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.SERVER_PORT;
const path = require("path");
const bodyParser = require("body-parser");
const {
  getOriginalLink,
  generateRandomId,
  addProtocolToURL,
} = require("./utils/function");
const { connection } = require("./utils/connection");

// * 미들웨어 설정
app.set("view engine", "ejs");
app.set("utils", path.join(__dirname, "utils"));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname));
// ? json으로 body를 받아오기 위해 필요한 미들웨어
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 루트 경로로 접근하면 메인 페이지 보여주기
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// 서버 시작 시 콘솔
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

// post 요청 핸들러
app.post("/", async (req, res) => {
  let originalLink = req.body.originalLink;
  let newEndPoint = generateRandomId(6);

  // original link가 빈문자열, undefined, null 등일 시에는 400 error
  if (!originalLink) {
    res.status(400).send();
    return;
  }

  // 생성된 newLink가 만에 하나 기존에 있던 링크라면 다시 생성하기
  try {
    let preExistingNewEndPoint = await getOriginalLink(newEndPoint);
    while (preExistingNewEndPoint !== null) {
      newEndPoint = generateRandomId(6);
      preExistingNewEndPoint = await getOriginalLink(newEndPoint);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("");
    return;
  }

  // url에 프로토콜이 붙어있지 않다면 붙이기
  originalLink = addProtocolToURL(originalLink);

  // row 생성 쿼리
  connection.query(
    "INSERT INTO shortenlink.link (originalLink, newEndPoint) VALUES (?, ?)",
    [originalLink, newEndPoint],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send();
        return;
      }

      const newLink =
        req.protocol + "://" + req.get("host") + req.originalUrl + newEndPoint;

      res.send({ newLink });
    }
  );
});

// 리다이렉트 코드
app.get("/:newEndPoint", async (req, res) => {
  const newEndPoint = req.params.newEndPoint;

  try {
    const originalLink = await getOriginalLink(newEndPoint);

    // original link를 찾지 못하는 경우
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
