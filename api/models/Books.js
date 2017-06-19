/**
 * Books.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    title: {
      type: 'string',
      unique: true
    },
    repo: {
      type: 'string'
    },
    branch: {
      type: 'string'
    }
  },
  afterCreate: function(values, cb) {
    if (!values.repo || !values.title) { return; }
    var shell = require('shelljs');
    var originalPath = shell.pwd();
    try {
      var inBooks =  shell.cd('assets/books');
      if (inBooks) {
        var repoCloned = shell.exec('git clone ' + values.repo + ' ' + values.title);
        if (repoCloned) {
          shell.cd(originalPath);
          cb();
          return;
        }
      }
      throw new Error('Something went wrong creating the repo.');
    }
    catch(err) {
      shell.cd(originalPath);
      cb(err);
    }
  },
  afterDestroy: function(destroyed, cb) {
    // move the repo into the .tmpdestroyed directory
    var shell = require('shelljs');
    var originalPath = shell.pwd();
    try {
      var inBooks =  shell.cd('assets/books');
      if (inBooks) {
        destroyed.forEach(function(book) {
          var tmpRepoRemoved =  shell.rm('-rf', '.tmp/' + book.title);
          var repoMoved = shell.mv([book.title], '.tmp/');
          console.log(repoMoved);
          if (repoMoved) {
            shell.cd(originalPath);
            cb();
            return;
          }
          else {
            shell.cd(originalPath);
          }
          throw new Error('Something went wrong moving the repo to the .tmp directory.');
        });
      }
    }
    catch(err) {
      shell.cd(originalPath);
      cb(err);
    }
  }
};