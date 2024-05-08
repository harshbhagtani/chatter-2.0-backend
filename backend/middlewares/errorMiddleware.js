const errorMiddleware = function (err, req, res, next) {
  const statusCode = err.status || 400;
  console.log(err, "Error");
  res
    .status(statusCode)
    .send({ error: { status: statusCode, message: err.message } });

  next();
};

module.exports = errorMiddleware;
