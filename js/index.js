//define(['require', 'exports', 'lib/index.js'], function(require, exports, os) {
require(['lib/index', 'js/test.js'], function(os, test) {
	window.os = os;
	window.test = test;
});
//});
