const fs = require('fs')
const path = require('path')

const { validationResult } = require('express-validator')

const Post = require('../models/post')
const { count } = require('console')

const setStatusCode500 = (err) => {
  if (!err.statusCode) {
    err.statusCode = 500
  }
}

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1
  const perPage = 2
  let totalItems
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
    })
    .then((posts) => {
      res.status(200).json({
        message: 'All Posts Fetched!',
        posts: posts,
        totalItems: totalItems,
      })
    })
    .catch((err) => {
      setStatusCode500(err)
      next(err)
    })
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed!, Entered Data Incorrect!')
    error.statusCode = 422
    throw error
  }

  if (!req.file) {
    const error = new Error('No Images Provided!')
    error.statusCode = 422
    throw error
  }
  // const imageUrl = req.file.path.replace('\\', '/')
  const imageUrl = req.file.filename
  const { title, content, creator } = req.body

  // create a post in db
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
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
      setStatusCode500(err)
      next(err)
    })
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
    .catch((err) => {
      setStatusCode500(err)
      next(err)
    })
}

exports.updatePost = (req, res, next) => {
  const { postId } = req.params
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('validation failed!, entered data incorrect.')
    error.statusCode = 422
    throw error
  }
  const { title, content } = req.body
  let imageUrl = req.body.image
  if (req.file) {
    imageUrl = req.file.filename
  }
  if (!imageUrl) {
    const error = new Error('No File Picked!')
    error.statusCode = 422
    throw error
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('could not find post.')
        error.status = 404
        throw error
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl)
      }
      post.title = title
      post.imageUrl = imageUrl
      post.content = content
      return post.save()
    })
    .then((result) => {
      res.status(200).json({ message: 'Post Updated!', post: result })
    })
    .catch((err) => {
      setStatusCode500(err)
      next(err)
    })
}

exports.deletePost = (req, res, next) => {
  const { postId } = req.params
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('could not find post.')
        error.status = 404
        throw error
      }
      //TODO: verify for login user
      clearImage(post.imageUrl)
      return Post.findByIdAndRemove(postId)
    })
    .then((result) => {
      console.log('DELETED!')
      res.status(200).json({
        message: 'Deleted Post!',
      })
    })
    .catch((err) => {
      setStatusCode500(err)
      next(err)
    })
}

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', 'images', filePath)
  fs.unlink(filePath, (err) => console.error('Deleted!'))
}
