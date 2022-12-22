const { validationResult } = require('express-validator')

const Post = require('../models/post')

const throwError = (err) => {
  if (!err.statusCode) {
    err.statusCode = 500
  }
  next(err)
}

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        message: 'All Posts Fetched!',
        posts: posts,
      })
    })
    .catch((err) => throwError(err))
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
    .catch((err) => throwError(err))
}

exports.getPost = (req, res, next) => {
  const { postId } = req.params
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('could not find post.')
        error.status = 404
        throw error
      }
      res.status(200).json({
        message: 'Post Fetched!',
        post: post,
      })
    })
    .catch((err) => throwError(err))
}
