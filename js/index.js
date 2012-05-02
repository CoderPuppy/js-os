//define(['require', 'exports', 'lib/index.js'], function(require, exports, os) {
require(['lib/index', 'js/test', 'lib/user'], function(os, test, user) {
	window.os = os;
	window.Machine = os.Machine;
	window.test = test;
	window.User = user.User;
});
//});
