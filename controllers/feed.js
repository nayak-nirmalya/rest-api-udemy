const { validationResult } = require('express-validator')

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
    return res.status(422).json({
      message: 'validation failed!, entered data incorrect.',
      errors: errors.array(),
    })
  }
  const { title, content } = req.body
  // create a post in db
  res.status(201).json({
    message: 'Post Created Successfully.',
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: { name: 'Nirmalya Nayak' },
      createdAt: new Date(),
    },
  })
}
