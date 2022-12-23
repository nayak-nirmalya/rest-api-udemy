const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const setStatusCode500 = (err) => {
  if (!err.statusCode) {
    err.statusCode = 500
  }
}

exports.signup = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!, Entered Data Incorrect!')
    error.statusCode = 422
    error.data = errors.array()
    throw error
  }
  const { email, name, password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
    })
    const result = await user.save()
    res.status(201).json({
      message: 'New User Created!',
      userId: result._id,
    })
  } catch (err) {
    setStatusCode500(err)
    next(err)
  }
}

exports.login = async (req, res, next) => {
  const { email, password } = req.body
  let loadedUser
  try {
    const user = await User.findOne({
      email: email,
    })
    if (!user) {
      const error = new Error('No User with this E-Mail Found!')
      error.statusCode = 401
      throw error
    }
    loadedUser = user
    const isEqual = await bcrypt.compare(password, user.password)

    if (!isEqual) {
      const error = new Error('Wrong Password!')
      error.statusCode = 401
      throw error
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      'whythiskolaveridi',
      {
        expiresIn: '1h',
      },
    )
    res.status(200).json({
      token: token,
      userId: loadedUser._id.toString(),
    })
  } catch (err) {
    setStatusCode500(err)
    next(err)
  }
}

exports.getUserStatus = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('User not Found!')
        error.statusCode = 404
        throw error
      }
      res.status(200).json({
        status: user.status,
      })
    })
    .catch((err) => {
      setStatusCode500(err)
      next(err)
    })
}

exports.updateUserStatus = (req, res, next) => {
  const newStatus = req.body.status
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('User not Found!')
        error.statusCode = 404
        throw error
      }
      user.status = newStatus
      return user.save()
    })
    .then((result) => {
      res.status(200).json({
        message: 'User Status Updated!',
      })
    })
    .catch((err) => {
      setStatusCode500(err)
      next(err)
    })
}
