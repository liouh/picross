Picross
=======

This is a playable [picross puzzle](http://en.wikipedia.org/wiki/Nonogram) generator written in JavaScript

You can access [an online version here](http://liouh.com/picross/)

### Instructions

* Left click : mark cell as active
* Left click + drag : mark multiple cells as active
* Right click : mark cell as inactive
* Right click + drag : mark multiple cells as inactive

On touch capable devices:

* Tap: mark cell as active
* Tap and hold: mark cell as inactive

### Features

* Adjustable grid dimensions (the code is generic and supports any dimension, but a 30x30 game can take up to 2 hours)
* Custom game seeds (allows multiple computers to play using the same starting puzzle configuration)
* Option to toggle crossouts, helping you track numbers that have already been solved
* Auto-saves using HTML5 web storage
* Progress indicator
* Mistakes counter

### Library Dependencies

* jQuery
* Backbone.js / Underscore.js
* [seedrandom.js](http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html)
