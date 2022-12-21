exports.getPost = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: 'First Post',
        content: 'Content of Post.',
      },
    ],
  })
}

exports.createPost = (req, res, next) => {
  const { title, content } = req.body
  // create a post in db
  res.status(201).json({
    message: 'Post Created Successfully.',
    post: {
      id: new Date().toISOString(),
      title: title,
      content: content,
    },
  })
}
