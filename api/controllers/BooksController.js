/**
 * BooksController
 *
 * @description :: Server-side logic for managing books
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  // 'findOne': function(req,res) {

  // },
  'getCommits': function(req, res) {
    var book = req.params.id;
    var shell = require('shelljs');
    var originalPath = shell.pwd();
    // cd into the books directory
    shell.find('assets');
    shell.cd('assets');
    shell.cd('books');
    shell.cd(book);
    shell.exec('ls');
    // get branches
    var output = [];
    var branches = ['master'];
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
  }
}