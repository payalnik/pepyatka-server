// var user = require('./routes/users')
// var session = require('./routes/session')

var home = require('./routes/index')
  , posts = require('./routes/posts')
  , comments = require('./routes/comments')
  , timeline = require('./routes/timeline')

var models = require('./models');

var helpers = function(req, res, next) {
  res.locals.loggedIn = function() {
    return req.session.userId !== undefined
  };

  next();
};

var noJSONP = function(req, res, next) {
  delete req.query.callback;
  next();
}

var findUser = function(req, res, next) {
  if (req.session.userId === undefined) {
    models.User.anon(function(userId) {
      req.session.userId = userId;
      
      next()
    });
  } else {
    // TODO: this could be a broken session
    next()
  }
}

var getUser = function(req, res, next) {
  models.User.find(req.session.userId, function(user) {
    if (user) {
      res.locals.currentUser = user
    } else {
      // ... redirect to auth page
    }

    next();
  })
}

module.exports = function(app, connections) {
  app.all('/*', helpers, findUser, getUser);

  // user.addRoutes(app);
  // session.addRoutes(app);

  // TODO: we do not need connection argument - we can get by with redis pub/sub
  home.addRoutes(app, connections);
  posts.addRoutes(app, connections);
  comments.addRoutes(app, connections);
  timeline.addRoutes(app, connections);
};
