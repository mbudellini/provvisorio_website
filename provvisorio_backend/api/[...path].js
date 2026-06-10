const app = require('../app')
const connectDB = require('../connectDB')

module.exports = async (req, res) => {
  await connectDB()
  return app(req, res)
}