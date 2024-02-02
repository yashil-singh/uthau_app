var jwt = require("jsonwebtoken");

function strictVerifyToken(req, res, next) {
  const secrectAccessKey = process.env.SECRET_KEY;

  var token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ auth: false, message: "No token provided." });
  }

  jwt.verify(token, secrectAccessKey, function (err, decoded) {
    if (err) {
      return res
        .status(500)
        .send({ auth: false, message: "Failed to verify token.", err, token });
    }

    req.decoded = decoded;
    next();
  });
}

module.exports = strictVerifyToken;
