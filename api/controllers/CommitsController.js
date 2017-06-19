/**
 * CommitsController
 *
 * @description :: Server-side logic for managing commits
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var shell = require('shelljs');

module.exports = {
  'findOne': function(req, res) {
    res.json('test');
  },
  'book': function(req,res) {
    // get branches
    var output = [];
    var branches = ['master','test'];
    branches.forEach(function(b,i) {
      var logCmd = 'git log '+ b +' --format=\'{"refs": "%d", "commit": "%h", "tree": "%t", "parent": "%p", "subject": "%s", "date": "%cd", "author": "%an %ae"},\' --reverse';
      var _commits = shell.exec(logCmd);
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
      }
    });
  }
};