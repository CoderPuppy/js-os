define(['require', 'exports', '../sha256'], function(require, exports, Crypto) {
	var PasswordAuthentication = exports.PasswordAuthentication = { // the password authentication
		password: function password(password) { // filter the `password`
			return Crypto.SHA256(password).toString(); // return the hashed version of it
		},
		authenticate: function authenticate(password, compare) { // authenticate the `compare` with `password`
			if(!password) { // no password
				console.warn('Make a password'); // don't like it
				return true; // and let them in
			}
			
			return Crypto.SHA256(compare).toString() === password; // otherwise if the hash of `compare` is equal to `password` which we hashed in password
		}
	};
});
