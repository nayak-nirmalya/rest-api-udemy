const fs = require('fs')
const path = require('path')

const { validationResult } = require('express-validator')

const Post = require('../models/post')
const User = require('../models/user')

const setStatusCode500 = (err) => {
  if (!err.statusCode) {
    err.statusCode = 500
  }
}

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1
  const perPage = 2
  try {
    const totalItems = await Post.find().countDocuments()
    const posts = await Post.find()
      .populate('creator')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)

    res.status(200).json({
      message: 'All Posts Fetched!',
      posts: posts,
      totalItems: totalItems,
    })
  } catch (error) {
    setStatusCode500(error)
    next(error)
  }
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

  const imageUrl = req.file.filename
  const { title, content } = req.body
  let creator

  // create a post in db and save
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  })
  post
    .save()
    .then((result) => {
      return User.findById(req.userId)
    })
    .then((user) => {
      creator = user
      user.posts.push(post)
      return user.save()
    })
    .then((result) => {
      res.status(201).json({
        message: 'Post Created Successfully.',
        post: post,
        creator: {
          _id: creator._id,
          name: creator.name,
        },
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
        const error = new Error('Could not Find Post.')
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
    const error = new Error('Validation Failed!, Entered Data Incorrect.')
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
        const error = new Error('Could not Find Post.')
        error.status = 404
        throw error
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not Authorized.')
        error.status = 403
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
        const error = new Error('Could not Find Post.')
        error.status = 404
        throw error
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not Authorized.')
        error.status = 403
        throw error
      }
      clearImage(post.imageUrl)
      return Post.findByIdAndRemove(postId)
    })
    .then((result) => {
      return User.findById(req.userId)
    })
    .then((user) => {
      user.posts.pull(postId)
      return user.save()
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
