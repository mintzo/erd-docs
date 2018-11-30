var myLogger = function (req, res, next) {
  console.log('LOGGED')
  next()
}

const attachToExpress = ({ expressApp, configurations }) => {
  expressApp.use(myLogger)
 }
 

module.exports.attachToServer = {
  express: attachToExpress
}


