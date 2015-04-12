"use strict";

var request = require('superagent')
    , app = require('../../index')

exports.flushDb = function() {
  return function(done) {
    $database.flushdbAsync()
        .then(function () {
          done()
        })
  }
}

exports.createUser = function(username, password, callback) {
  return function(done) {
    var user = {
      username: username,
      password: password
    }

    request
        .post(app.config.host + '/v1/users')
        .send({ username: user.username, password: user.password })
        .end(function(err, res) {
          if (callback) {
            var luna = res.body.users
            luna.password = user.password
            callback(res.body.authToken, luna)
          }
          done()
        })

  }
}

exports.createUserCtx = function(context, username, password) {
  return exports.createUser(username, password, function(token) {
    context.authToken = token
  })
}

exports.createPost = function(context, body, callback) {
  return function(done) {
    request
        .post(app.config.host + '/v1/posts')
        .send({ post: { body: body }, authToken: context.authToken })
        .end(function(err, res) {
          context.post = res.body.posts
          if (callback) {
            callback(context.post)
          }
          done()
        })
  };
}


exports.createComment = function(body, postId, authToken, callback) {
  return function(done) {
    var comment = {
      body: body,
      postId: postId
    }

    request
      .post(app.config.host + '/v1/comments')
      .send({ comment: comment, authToken: authToken })
      .end(function(err, res) {
        done(err, res)
      })
  }(callback)
}
