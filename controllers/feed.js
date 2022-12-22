const { validationResult } = require('express-validator')

const Post = require('../models/post')

exports.getPost = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: '1',
        title: 'First Post',
        content: 'Content of Post.',
        imageUrl: 'images/lightning-mcqueen-cars.jpg',
        creator: {
          name: 'Nirmalya',
        },
        createdAt: new Date(),
      },
    ],
  })
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('validation failed!, entered data incorrect.')
    error.statusCode = 422
    throw error
  }
  const { title, content, imageUrl, creator } = req.body

  // create a post in db
  const post = new Post({
    title: title,
    content: content,
    imageUrl: 'imageUrl',
    creator: { name: 'Nirmalya Nayak' },
  })
  post
    .save()
    .then((result) => {
      console.log(result)
      res.status(201).json({
        message: 'Post Created Successfully.',
        post: result,
      })
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}
