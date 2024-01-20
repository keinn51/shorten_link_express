const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const bodyParser = require("body-parser");
const { getOriginalLink, generateRandomId } = require("./utils/function");
const { connection } = require("./utils/connection");

// * 미들웨어 설정
app.set("view engine", "ejs");
app.set("utils", path.join(__dirname, "utils"));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname));
// ? json으로 body를 받아오기 위해 필요한 미들웨어
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function addProtocolToURL(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
}

// 루트 경로에 대한 핸들러
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

// submit시 실행 함수
app.post("/", async (req, res) => {
  console.log(req.body, req.body.originalLink);
  let originalLink = req.body.originalLink;
  let newEndPoint = generateRandomId(6);

  try {
    let preExistingnewEndPoint = await getOriginalLink(newEndPoint);
    while (preExistingnewEndPoint !== null) {
      newEndPoint = generateRandomId(6);
      preExistingnewEndPoint = await getOriginalLink(newEndPoint);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("");
    return;
  }

  originalLink = addProtocolToURL(originalLink);

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

// 리다이렉트
app.get("/:newEndPoint", async (req, res) => {
  const newEndPoint = req.params.newEndPoint;

  if (newEndPoint === "404.ejs") {
    return;
  }

  try {
    const originalLink = await getOriginalLink(newEndPoint);

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
