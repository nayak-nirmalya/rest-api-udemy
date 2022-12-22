const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

const User = require('../models/user')

const setStatusCode500 = (err) => {
  if (!err.statusCode) {
    err.statusCode = 500
  }
}

exports.signup = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!, Entered Data Incorrect!')
    error.statusCode = 422
    error.data = errors.array()
    throw error
  }
  const { email, name, password } = req.body
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name,
      })
      return user.save()
    })
    .then((result) => {
      res.status(201).json({
        message: 'New User Created!',
        userId: result._id,
      })
    })
    .catch((err) => {
      setStatusCode500(err)
      next(err)
    })
}

exports.login = (req, res, next) => {
  const { email, password } = req.body
  let loadedUser
  User.findOne({
    email: email,
  })
    .then((user) => {
      if (!user) {
        const error = new Error('No User with this E-Mail Found!')
        error.statusCode = 401
        throw error
      }
      loadedUser = user
      return bcrypt.compare(password, user.password)
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error('Wrong Password!')
        error.statusCode = 401
        throw error
      }
    })
    .catch((err) => {
      setStatusCode500(err)
      next(err)
    })
}
