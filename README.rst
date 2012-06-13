Bump.js
=======

Dependencies
============
* grunt (>= 0.3.9)
* uglify-js (>= 1.2.3)

The current version of grunt runs ``uglify-js@1.0.7``, which contains a bug causing exponential runtime when minifying BoxBoxDetector.js. The current workaround is::

	$ cd node_modules/grunt
	$ npm install uglify-js@1.2.6

One time setup for build process:
---------------------------------

* Node.js (installation: https://github.com/joyent/node/wiki/Installation)
* NPM (installation: ``curl http://npmjs.org/install.sh | sh``)
* grunt (installation: ``npm install -g grunt``)

Setup
-----

Once the dependencies are installed::

	$ grunt
