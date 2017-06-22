/**
 * BooksController
 *
 * @description :: Server-side logic for managing books
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  findOne: function(req,res) {
    Books.findOne({
      title: req.params.id
    }).exec(function(err, book) {
      if (err) { return res.negotiate(err)}
      return res.json(book);
    });
  },
  getCommits: function(req, res) {
    Books.findOne({
      title: req.params.id
    }).exec(function(err, book) {
      var shell = require('shelljs');
      var originalPath = shell.pwd();
      // cd into the books directory
      shell.find('assets');
      shell.cd('assets');
      shell.cd('books');
      shell.cd(book.title);
      // get branches
      var output = [];
      var branches = [book.branch, book.mergeBranch];
      branches.forEach(function(b,i) {
        if (i === 0) {
          var branch = b;
        }
        else {
          var branch = 'origin/' + b;
        }
        var logCmd = 'git log '+ branch +' --max-count="100" --format=\'{"refs": "%d", "commit": "%h", "tree": "%t", "parent": "%p", "subject": "%s", "date": "%cd", "author": "%an %ae"},\' --reverse';
        // if this is the secondary branch then pull it in.
        var _commits = shell.exec(logCmd, {silent:true});
        var _commits = _commits.slice(0, -1);
        var _commits = _commits.slice(0, -1);
        var _commits = '[' + _commits + ']';
        var _commits = JSON.parse(_commits);
        var _output = {
          branch: b,
          commits: _commits
        }
        output.push(_output);
        if (i === branches.length - 1) {
          res.json(output);
          shell.cd(originalPath);
        }
      });
    });
  },
  canMerge: function(req,res) {
    Books.findOne({
      title: req.params.id
    }).exec(function(err, book) {
      if (err) { return res.negotiate(err)}
      var shell = require('shelljs');
      var originalPath = shell.pwd();
      var mergeBranch = book.mergeBranch;
      var bookDir = shell.cd('assets/books/' + book.title);
      // see if you can merge
      var fetch = shell.exec('git fetch --all');
      var canMerge = shell.exec('git merge --no-commit --no-ff origin/' + mergeBranch);
      if (canMerge.stderr.includes('Automatic merge went well; stopped before committing as requested')) {
        // make sure you abort the fake merge
        shell.exec('git merge --abort');
        shell.cd(originalPath);
        res.json(true);
      }
      else {
        // make sure you abort the fake merge
        shell.exec('git merge --abort');
        shell.cd(originalPath);
        res.json(false);
      }
    });
  },
  sync: function(req, res) {
     Books.findOne({
      title: req.params.id
    }).exec(function(err, book) {
      if (err) { return res.negotiate(err)}
      var shell = require('shelljs');
      var originalPath = shell.pwd();
      var mergeBranch = book.mergeBranch;
      var bookDir = shell.cd('assets/books/' + book.title);
      // see if you can merge
      var canMerge = shell.exec('git merge --no-commit --no-ff origin/' + mergeBranch);
      if (canMerge.stderr.includes('Automatic merge went well; stopped before committing as requested')) {
        // make sure you abort the fake merge
        shell.exec('git commit -m "gitbook sync"');
        shell.exec('git push origin ' + book.branch);
        shell.exec('git fetch origin ' + book.branch + ':' + book.mergeBranch);
        shell.exec('git push origin ' + book.mergeBranch);
        shell.exec('git merge --abort');
        shell.cd(originalPath);
        res.json(true);
      }
      else {
        // make sure you abort the fake merge
        shell.exec('git merge --abort');
        shell.cd(originalPath);
        res.json(false);
      }
    });
  }
}