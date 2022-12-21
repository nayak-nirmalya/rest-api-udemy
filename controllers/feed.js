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
