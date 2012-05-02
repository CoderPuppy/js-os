#Javascript OS
A Unix-type operating system written in javascript to run on any javascript engine

#API
The API is pretty simple it consists of creating machines, creating users, logging them in, opening terminals and running some commands

To create a machine you just run `new Machine("You machines name")` or the definition


`new Machine(<name>, <fsData>)`


  `<name>` is you machines name, if you want it (it isn't used anywhere yey)
  
  
  `<fsData>` _optional_ the data you want to populate the filesystem (see [FilesystemJS](http://github.com/drewyoung1/FilesystemJS))


To create a user it's easy: `machine.createUser("your username", "your authentication method")` and the def is...


`<machine>.createUser(<username>, <authenticationMethod>)`
  
  
  `<machine>` is the machine you are creating a user on
  
  
  `<username>` is the username of the user you wish to create
  
  
  `<authenticationMethod>` is you method of authentication _default_: `'always'`

To login run `machine.login("your username", "your password", function callback() {})`, or of course the definition


`<machine>.login(<username>, <password>, <callback>)`


  `<machine>` is the machine you created
  
  
  `<username>` is the username you want to login as
  
  
  `<password>` is of course the password (depending on what authentication method it will have to be of different format)
  
  
  `<callback>` is the callback for when you get logged in it gets 2 parameters an error (which i seem to forget) and a session