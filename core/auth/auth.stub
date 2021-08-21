var jwt = require("jsonwebtoken");
const secretKey = "mySecretKey";

const { Users } = require("../models");

// Authorization: Bearer <TOKEN>
exports.verifyToken = async (req, res, next) => {
  try {
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader === undefined)
      return res.status(403).json({
        message: "No token provided",
      });

    const bearerToken = bearerHeader.split(" ")[1];
    const decoded = jwt.verify(bearerToken, secretKey);
    console.log(decoded);
    req.userId = decoded.id;

    const user = await Users.findByPk(req.userId);
    if (!user)
      return res.status(404).json({
        message: "No user found",
      });
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const users = await Users.findOne({ where: req.body });
    // console.log(users);
    if (users) {
      console.log(users.dataValues);
      const token = jwt.sign(users.dataValues, secretKey);
      console.log(token);
      res.status(200).send({
        ok: true,
        msg: "Login success.",
        data: users,
        token,
      });
    } else {
      res.status(404).send({
        ok: false,
        msg: "Login Failed. User not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};
