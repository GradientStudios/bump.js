Bump.js
=======

bump.js is JavaScript port of the Bullet physics engine.

Dependencies
============

* Node.js (installation: http://nodejs.org/#download)
* NPM (installation: https://npmjs.org/doc/README.html#Super-Easy-Install)

The current version of grunt runs ``uglify-js@1.0.7``, which contains a bug causing exponential runtime when minifying bump.js. Running ``make`` will fix this locally. What it is doing under the hood is::

	$ cd node_modules/grunt
	$ npm install uglify-js@1.2.6

Build
-----

Once the dependencies are installed::

	$ make
