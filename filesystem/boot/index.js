define(['require', 'exports', './env', './fs/index', './user'], function(require, exports, env, fs, user) {
	var Environment = exports.Environment = env.Environment; // Import environment
	var Filesystem = exports.Filesystem = fs.Filesystem; // Import filesystem
	var User = exports.User = user.User; // Import user
	
	function clone(o) { // Clone object o
		function cloned(){} // Create a class cloned
		cloned.prototype = o; // Set it's prototype to the object to be cloned: means every new instance of this class will be the same as o but a seperate object
		return new cloned; // Return a new one that it just about the same as o
	}
	
	exports.Machine = (function() { // Main class: houses: filesystem and users
		function Machine(name, fsData) { // Machine takes a name of the machine and some optional fsdata which is passed on to it's filesystem
			this.name = name; // Save it's name
			this.users = {}; // Create an empty object to house users
			
			fsData = fsData || { // Make sure we have some data for the filesystem
				root: { // Define the root of the filesystem
					files: {
						bin: { // folder bin
							files: { // it has most/all of the commands
								echo: { // Echo prints out it's args
									executable: true, // it's executable
									command: { // The actual command data
										exec: function(args, context) { // Exec: executes the command
											context.view.stream.write(args.join(' ')); // print it out to the view
											context.data.write(args.join(' ')); // and also to data so then it can be piped to a file or another command
										}
									}
								},
								pwd: { // pwd: print working directory
									executable: true, // executable
									command: { // the command data
										exec: function(args, context) { // and how to execute it
											context.view.stream.write(context.fs.pathTo(context.currentDir)); // print out the current directory to the view
											context.data.write(context.fs.pathTo(context.currentDir)); // and also to data
										}
									}
								},
								ls: { // ls: list files
									executable: true, // executable
									command: { // the command data
										exec: function(args, context) { // and how to execute it
											var files = context.fs.listFiles(context.fs.getFile(args[0], context.currentDir)); // get all the files in the current directory
											
											files.forEach(function(file) { // loop through them to print them out
												context.view.stream.write(file.name); // print out the file on to the view
											});
										}
									}
								},
								cd: { // cd: change directory || change working directory
									executable: true, // executable
									command: { // the command data
										exec: function(args, context) { // and how to execute it
											context.currentDir = context.fs.getFile(args[0], context.currentDir) || context.currentDir; // set the current dir to the new current dir
										}
									}
								},
								alert: { // alert: alert data
									executable: true, // executable
									command: { // the command data
										exec: function(args, context) { // and how to execute it
											if(args.length > 0 && args[0]) alert(args.join(' ')); // it we have arguments print them
											context.data.on('data', function(d) { // then when we here stuff
												alert(d); // alert it
											}).unpause();
										}
									}
								},
								sleep: { // sleep: wait for a few seconds
									executable: true, // executable
									command: { // the command data
										exec: function(args, context, cb) { // and how to execute it
											var time = /^[1-9]\d*$/.test(args[0]) ? parseInt(args[0]) : 1000; // figure out how long to wait for
											setTimeout(function() { cb(0); }, time); // when that time elapses call the callback
										}
									}
								},
								test: { // test: i dunno how bout you || a command to test stuff with
									executable: true, // executable
									command: { // the command data
										params: [ // parameters that are parsed
											{ // each is an object
												name: 'testParam', // the name of the parameter
												type: 'string' // and it's type which determins what you get in the command
											},
											{
												name: 'testNumber', // name
												type: 'number' // this is a better example of type this will parse it into a number
											},
											{
												name: 'testPassword', // name
												type: 'password' // should hide it the data
											},
											{
												name: 'testSelection', // name
												type: { // object for type: lets you set parameters for the type
													name: 'selection', // type selection: basicly: select from some names
													values: { // what values to allow (though the type can determine if the value is valid nothing uses that data
														testValue: 'Some other value', // what the user sees: what you get
														thisOtherValue: 'sfj' // same as above
													}
												}
											}
										],
										exec: function(args, context) { // and finally we learn what this command does
											console.log(arguments); // log the arguments
											context.data.on('data', function(d) { // listen for data
												alert('someone sent me: ' + d); // and alert it
											});
										} // hmm, not too interesting
									}
								},
								badExit: { // badExit: simulate a failed command
									executable: true, // executable
									command: { // the command data
										exec: function(args, context) { // and how to execute it
											context.view.stream.write('I have an error'); // say that it has an error
											context.err.write('I have an error'); // again
											return 1; // return a non-zero exit code to say you had an error
										}
									}
								}
							}
						}
					}
				}
			};
			
			this.fs = new Filesystem(fsData); // Create a filesystem with the fsdata that we made sure we have
			this.env = new Environment({ // Create a global environment that holds all the global environment variables
				vars: { // the vars
					PATH: "/bin" // look for stuff to run in /bin
				}
			}, this.fs); // why does this need to have the filesystem again... oh maybe it doesn't but documenting right now
			
			this.authMethods = clone(this.authMethods); // learn how to authenticate users (make sure we don't write to the prototype)
		}
		
		Machine.prototype.authMethods = { // the default methods of authentication
			always: { // always: always allow
				authenticate: function authenticate(password, userPassword) { // is this user authentic: takes the password stored in the user and the password to check
					console.log(password, userPassword); // MAHHAHHAHHA!!!!! log out the password (the password stored in the user and the password the user entered in) for good... or evil
					
					return true; // and always let them in (true for allow, false for deny)
				},
				password: function password(newP) { // filter the password takes the new password
					console.log(newP); // log it for good... or evil!!!
					
					return newP; // and just return it plain but you could hash it like I do with password authentication
				}
			}
		};
		
		Machine.prototype.createUser = function createUser(name, auth) { // create a user with a name of name and that is authorized by `auth` method
			if(this.users[name] instanceof User) throw new Error('Cannot create duplicate users'); // Make sure we don't overwrite any existing users
			
			return this.users[name] = new User(this, name, auth); // Create the user and save it
		};
		
		Machine.prototype.removeUser = function removeUser(name) { // Remove the user this the name of `name`
			delete this.users[name]; // just delete it
		};
		
		Machine.prototype.auth = function auth(method) { // Get the authorization thing-a-ma-gig
			return this.authMethods[method] || this.authMethods['always']; // return the one they were looking for... or the on that always says yes
		};
		
		Machine.prototype.login = function login(user, pass, cb) { // login: convience method logging in
			if(this.users[user]) { // make sure we a user with that name
				this.users[user].authenticate(pass, cb); // and authenticate them
			}
			
			return this; // make stuff chainable
		};
		
		return Machine;
	})();
});
