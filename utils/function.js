const { connection } = require("./connection");

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

function getOriginalLink(newEndPoint) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM shortenlink.link WHERE newEndPoint='${newEndPoint}' LIMIT 1`,
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

module.exports = {
  generateRandomId,
  getOriginalLink,
};
