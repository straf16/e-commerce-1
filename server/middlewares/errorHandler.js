const { deleteFileGcs } = require('../helpers/image')

module.exports = {
  errorHandler: function (err, req, res, next) {
    // console.log(err)

    if (process.env.NODE_ENV) {
      if (req.body.images) {
        let images = req.body.images
        let arrPromise = []
        images.forEach(url => {
          arrPromise.push(deleteFileGcs(url))
        })
        Promise
          .all(arrPromise)
          .then(console.log)
          .catch(console.log)
      }
    }
    let status = err.status || 500
    let message = [err.message] || ['Internal Server Error']
    switch (err.name) {
      case 'ValidationError':
        message = []
        for (const key in err.errors) {
          message.push(err.errors[key].message)
        }
        res.status(400).json({ message })
        break
      case 'MongoError':
        if (err.code == 11000) {
          message = ['Data already exist']
          res.status(400).json({ message })
        } else {
          res.status(status).json({ message })
        }
        break
      case 'JsonWebTokenError':
        message = []
        if (err.message === 'invalid signature') {
          message.push('invalid token')
        } else if (err.message === 'jwt must be provided') {
          message.push('no user login')
        } else if (err.message === 'jwt malformed') {
          message.push('Please login again')
        } else {
          message.push(err.message)
        }
        res.status(400).json({ message })
        break
      default:
        res.status(status).json({ message })
        break
    }
  }
}
