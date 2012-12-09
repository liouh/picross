Picross
=======

This is a playable [picross puzzle](http://en.wikipedia.org/wiki/Nonogram) generator I wrote in JavaScript

### Features

* Adjustable grid dimensions (the code is generic and supports any dimension, but a 30x30 game can take up to 2 hours)
* Custom game seeds (allows multiple computers to play using the same starting puzzle configuration)
* Progress indicator
* Mistake counter

### Instructions

* Left click : mark cell as active
* Left click & drag : mark multiple cells as active
* Right click : mark cell as inactive
* Right click & drag : mark multiple cells as inactive

### Library dependencies:

* jQuery
* Backbone.js / Underscore.js
* [seedrandom.js](http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html)
