$(function() {

	// localStorage save format versioning
	var saveVersion = '2019.08.03';

	var touchSupport = true;

	var PuzzleModel = Backbone.Model.extend({

		defaults: function() {
			return {
				dimensionWidth: 10,		// default dimension width
				dimensionHeight: 10,	// default dimension height
				state: [],
				hintsX: [],
				hintsY: [],
				guessed: 0,
				total: 100,
				complete: false,
				perfect: false,
				seed: 0,
				darkMode: false,
				easyMode: true	// show crossouts
			};
		},

		initialize: function() {
			this.on('change', this.save);
		},

		save: function() {
			if(localStorageSupport()) {
				localStorage['picross2.saveVersion'] = saveVersion;

				localStorage['picross2.dimensionWidth'] = JSON.stringify(this.get('dimensionWidth'));
				localStorage['picross2.dimensionHeight'] = JSON.stringify(this.get('dimensionHeight'));
				localStorage['picross2.state'] = JSON.stringify(this.get('state'));
				localStorage['picross2.hintsX'] = JSON.stringify(this.get('hintsX'));
				localStorage['picross2.hintsY'] = JSON.stringify(this.get('hintsY'));
				localStorage['picross2.guessed'] = JSON.stringify(this.get('guessed'));
				localStorage['picross2.total'] = JSON.stringify(this.get('total'));
				localStorage['picross2.complete'] = JSON.stringify(this.get('complete'));
				localStorage['picross2.perfect'] = JSON.stringify(this.get('perfect'));
				localStorage['picross2.seed'] = JSON.stringify(this.get('seed'));
				localStorage['picross2.darkMode'] = JSON.stringify(this.get('darkMode'));
				localStorage['picross2.easyMode'] = JSON.stringify(this.get('easyMode'));
			}
		},

		resume: function() {

			if(!localStorageSupport() || localStorage['picross2.saveVersion'] != saveVersion) {
				this.reset();
				return;
			}

			var dimensionWidth = JSON.parse(localStorage['picross2.dimensionWidth']);
			var dimensionHeight = JSON.parse(localStorage['picross2.dimensionHeight']);
			var state = JSON.parse(localStorage['picross2.state']);
			var hintsX = JSON.parse(localStorage['picross2.hintsX']);
			var hintsY = JSON.parse(localStorage['picross2.hintsY']);
			var guessed = JSON.parse(localStorage['picross2.guessed']);
			var total = JSON.parse(localStorage['picross2.total']);
			var complete = JSON.parse(localStorage['picross2.complete']);
			var perfect = JSON.parse(localStorage['picross2.perfect']);
			var seed = JSON.parse(localStorage['picross2.seed']);
			var darkMode = JSON.parse(localStorage['picross2.darkMode']);
			var easyMode = JSON.parse(localStorage['picross2.easyMode']);

			this.set({
				dimensionWidth: dimensionWidth,
				dimensionHeight: dimensionHeight,
				state: state,
				hintsX: hintsX,
				hintsY: hintsY,
				guessed: guessed,
				total: total,
				complete: complete,
				perfect: perfect,
				seed: seed,
				darkMode: darkMode,
				easyMode: easyMode
			});
		},

		reset: function(customSeed) {

			var seed = customSeed;
			if(seed === undefined) {
				seed = '' + new Date().getTime();
			}
			Math.seedrandom(seed);

			var solution = [];
			var state = [];
			var total = 0;

			for(var i = 0; i < this.get('dimensionHeight'); i++) {
				solution[i] = [];
				state[i] = [];
				for(var j = 0; j < this.get('dimensionWidth'); j++) {
					var random = Math.ceil(Math.random() * 2);
					solution[i][j] = random;
					total += (random - 1);
					state[i][j] = 0;
				}
			}

			var hintsX = this.getHintsX(solution);
			var hintsY = this.getHintsY(solution);

			this.set({
				state: state,
				hintsX: hintsX,
				hintsY: hintsY,
				guessed: 0,
				total: total,
				complete: false,
				perfect: false,
				seed: seed
			}, {silent: true});
			this.trigger('change');
		},

		getHintsX: function(solution) {
			var hintsX = [];

			for(var i = 0; i < this.get('dimensionHeight'); i++) {
				var streak = 0;
				hintsX[i] = [];
				for(var j = 0; j < this.get('dimensionWidth'); j++) {
					if(solution[i][j] < 2) {
						if(streak > 0) {
							hintsX[i].push(streak);
						}
						streak = 0;
					}
					else {
						streak++;
					}
				}
				if(streak > 0) {
					hintsX[i].push(streak);
				}
			}

			return hintsX;
		},

		getHintsY: function(solution) {
			var hintsY = [];

			for(var j = 0; j < this.get('dimensionWidth'); j++) {
				var streak = 0;
				hintsY[j] = [];
				for(var i = 0; i < this.get('dimensionHeight'); i++) {
					if(solution[i][j] < 2) {
						if(streak > 0) {
							hintsY[j].push(streak);
						}
						streak = 0;
					}
					else {
						streak++;
					}
				}
				if(streak > 0) {
					hintsY[j].push(streak);
				}
			}

			return hintsY;
		},

		guess: function(x, y, guess) {
			var state = this.get('state');
			var guessed = this.get('guessed');

			if(state[x][y] === 2) {
				guessed--;
			}

			if(state[x][y] === guess) {
				state[x][y] = 0;
			} else {
				state[x][y] = guess;
				if(guess === 2) {
					guessed++;
				}
			}

			this.set({
				state: state,
				guessed: guessed
			}, {silent: true});

			this.updateCrossouts(state, x, y);
		},

		updateCrossouts: function(state, x, y) {
			var hintsX = this.get('hintsX');
			var hintsY = this.get('hintsY');

			// cross out row hints
			var filled = true;
			var cellIndex = 0;
			var hintIndex = 0;
			for(cellIndex; cellIndex < state[x].length;) {
				if(state[x][cellIndex] === 2) {
					if(hintIndex < hintsX[x].length) {
						for(var i = 0; i < Math.abs(hintsX[x][hintIndex]); i++) {
							if(state[x][cellIndex] === 2) {
								cellIndex++;
							} else {
								filled = false;
								break;
							}
						}
						if(state[x][cellIndex] === 2) {
							filled = false;
							break;
						}
						hintIndex++;
					} else {
						filled = false;
						break;
					}
				} else {
					cellIndex++;
				}
			}
			if(cellIndex < state[x].length || hintIndex < hintsX[x].length) {
				filled = false;
			}
			for(var i = 0; i < hintsX[x].length; i++) {
				hintsX[x][i] = Math.abs(hintsX[x][i]) * (filled ? -1 : 1);
			}

			// cross out column hints
			filled = true;
			cellIndex = 0;
			hintIndex = 0;
			for(cellIndex; cellIndex < state.length;) {
				if(state[cellIndex][y] === 2) {
					if(hintIndex < hintsY[y].length) {
						for(var i = 0; i < Math.abs(hintsY[y][hintIndex]); i++) {
							if(cellIndex < state.length && state[cellIndex][y] === 2) {
								cellIndex++;
							} else {
								filled = false;
								break;
							}
						}
						if(cellIndex < state.length && state[cellIndex][y] === 2) {
							filled = false;
							break;
						}
						hintIndex++;
					} else {
						filled = false;
						break;
					}
				} else {
					cellIndex++;
				}
			}
			if(cellIndex < state.length || hintIndex < hintsY[y].length) {
				filled = false;
			}
			for(var i = 0; i < hintsY[y].length; i++) {
				hintsY[y][i] = Math.abs(hintsY[y][i]) * (filled ? -1 : 1);
			}

			this.set({
				hintsX: hintsX,
				hintsY: hintsY
			}, {silent: true});
			this.trigger('change');
		}

	});

	var PuzzleView = Backbone.View.extend({

		el: $("body"),

		events: function() {
			if(touchSupport && 'ontouchstart' in document.documentElement) {
				return {
					"click #new": "newGame",
					"click #solve": "solve",
					"change #dark": "changeDarkMode",
					"change #easy": "changeEasyMode",
					"mousedown": "clickStart",
					"mouseover td.cell": "mouseOver",
					"mouseout td.cell": "mouseOut",
					"mouseup": "clickEnd",
					"touchstart td.cell": "touchStart",
					"touchmove td.cell": "touchMove",
					"touchend td.cell": "touchEnd",
					"submit #customForm": "newCustom",
					"click #seed": function(e) { e.currentTarget.select(); },
					"click #customSeed": function(e) { e.currentTarget.select(); },
					"contextmenu": function(e) { e.preventDefault(); }
				}
			} else {
				return {
					"click #new": "newGame",
					"click #solve": "solve",
					"change #dark": "changeDarkMode",
					"change #easy": "changeEasyMode",
					"mousedown": "clickStart",
					"mouseover td.cell": "mouseOver",
					"mouseout td.cell": "mouseOut",
					"mouseup": "clickEnd",
					"submit #customForm": "newCustom",
					"click #seed": function(e) { e.currentTarget.select(); },
					"click #customSeed": function(e) { e.currentTarget.select(); },
					"contextmenu": function(e) { e.preventDefault(); }
				}
			}
		},

		mouseStartX: -1,
		mouseStartY: -1,
		mouseEndX: -1,
		mouseEndY: -1,
		mouseMode: 0,

		initialize: function() {
			this.model.resume();
			$('#dimensions').val(this.model.get('dimensionWidth') + 'x' + this.model.get('dimensionHeight'));
			if(this.model.get('darkMode')) {
				$('#dark').attr('checked', 'checked');
			} else {
				$('#dark').removeAttr('checked');
			}
			if(this.model.get('easyMode')) {
				$('#easy').attr('checked', 'checked');
			} else {
				$('#easy').removeAttr('checked');
			}
			this.render();
			this.showSeed();
		},

		changeDarkMode: function(e) {
			var darkMode = $('#dark').attr('checked') !== undefined;
			this.model.set({darkMode: darkMode});
			this.render();
		},

		changeEasyMode: function(e) {
			var easyMode = $('#easy').attr('checked') !== undefined;
			this.model.set({easyMode: easyMode});
			this.render();
		},

		changeDimensions: function(e) {
			var dimensions = $('#dimensions').val();
			dimensions = dimensions.split('x');
			this.model.set({
				dimensionWidth: dimensions[0],
				dimensionHeight: dimensions[1]
			});
		},

		_newGame: function(customSeed) {
			$('#solve').prop('disabled', false);
			$('#puzzle').removeClass('complete');
			$('#puzzle').removeClass('perfect');
			$('#progress').removeClass('done');
			this.changeDimensions();
			this.model.reset(customSeed);
			this.render();
			this.showSeed();
		},

		newGame: function(e) {
			$('#customSeed').val('');
			this._newGame();
		},

		newCustom: function(e) {
			e.preventDefault();

			var customSeed = $.trim($('#customSeed').val());
			if(customSeed.length) {
				this._newGame(customSeed);
			} else {
				this._newGame();
			}
		},

		showSeed: function() {
			var seed = this.model.get('seed');
			$('#seed').val(seed);
		},

		clickStart: function(e) {
			if(this.model.get('complete')) {
				return;
			}

			var target = $(e.target);

			if(this.mouseMode != 0 || target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
				this.mouseMode = 0;
				this.render();
				return;
			}

			this.mouseStartX = target.attr('data-x');
			this.mouseStartY = target.attr('data-y');
			switch (e.which) {
				case 1:
					// left click
					e.preventDefault();
					this.mouseMode = 1;
					break;
				case 3:
					// right click
					e.preventDefault();
					this.mouseMode = 3;
					break;
			}
		},

		mouseOver: function(e) {
			var target = $(e.currentTarget);
			var endX = target.attr('data-x');
			var endY = target.attr('data-y');
			this.mouseEndX = endX;
			this.mouseEndY = endY;

			$('td.hover').removeClass('hover');
			$('td.hoverLight').removeClass('hoverLight');

			if(this.mouseMode === 0) {
				$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + '][data-y=' + endY + ']').addClass('hover');
				return;
			}

			var startX = this.mouseStartX;
			var startY = this.mouseStartY;

			if(startX === -1 || startY === -1) {
				return;
			}

			var diffX = Math.abs(endX - startX);
			var diffY = Math.abs(endY - startY);

			if(diffX > diffY) {
				$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
				var start = Math.min(startX, endX);
				var end = Math.max(startX, endX);
				for(var i = start; i <= end; i++) {
					$('td.cell[data-x=' + i + '][data-y=' + startY + ']').addClass('hover');
				}
			} else {
				$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
				var start = Math.min(startY, endY);
				var end = Math.max(startY, endY);
				for(var i = start; i <= end; i++) {
					$('td.cell[data-x=' + startX + '][data-y=' + i + ']').addClass('hover');
				}
			}
		},

		mouseOut: function(e) {
			if(this.mouseMode === 0) {
				$('td.hover').removeClass('hover');
				$('td.hoverLight').removeClass('hoverLight');
			}
		},

		clickEnd: function(e) {
			if(this.model.get('complete')) {
				return;
			}

			var target = $(e.target);
			switch (e.which) {
				case 1:
					// left click
					e.preventDefault();
					if(this.mouseMode != 1) {
						this.mouseMode = 0;
						return;
					}
					if(target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
						this.clickArea(this.mouseEndX, this.mouseEndY, 2);
					} else {
						this.clickArea(target.attr('data-x'), target.attr('data-y'), 2);
					}
					break;
				case 3:
					// right click
					e.preventDefault();
					if(this.mouseMode != 3) {
						this.mouseMode = 0;
						return;
					}
					if(target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
						this.clickArea(this.mouseEndX, this.mouseEndY, 1);
					} else {
						this.clickArea(target.attr('data-x'), target.attr('data-y'), 1);
					}
					break;
			}
			this.mouseMode = 0;
			this.render();
		},

		clickArea: function(endX, endY, guess) {
			var startX = this.mouseStartX;
			var startY = this.mouseStartY;

			if(startX === -1 || startY === -1) {
				return;
			}

			var diffX = Math.abs(endX - startX);
			var diffY = Math.abs(endY - startY);

			if(diffX > diffY) {
				for(var i = Math.min(startX, endX); i <= Math.max(startX, endX); i++) {
					this.model.guess(i, startY, guess);
				}
			} else {
				for(var i = Math.min(startY, endY); i <= Math.max(startY, endY); i++) {
					this.model.guess(startX, i, guess);
				}
			}
		},

		touchStart: function(e) {
			if(this.model.get('complete')) {
				return;
			}
			var target = $(e.target);
			this.mouseStartX = this.mouseEndX = e.originalEvent.touches[0].pageX;
			this.mouseStartY = this.mouseEndY = e.originalEvent.touches[0].pageY;
			var that = this;
			this.mouseMode = setTimeout(function() {
				that.model.guess(target.attr('data-x'), target.attr('data-y'), 1);
				that.render();
			}, 750);
		},

		touchMove: function(e) {
			if(this.model.get('complete')) {
				return;
			}
			this.mouseEndX = e.originalEvent.touches[0].pageX;
			this.mouseEndY = e.originalEvent.touches[0].pageY;
			if(Math.abs(this.mouseEndX - this.mouseStartX) >= 10 || Math.abs(this.mouseEndY - this.mouseStartY) >= 10) {
				clearTimeout(this.mouseMode);
			}
		},

		touchEnd: function(e) {
			if(this.model.get('complete')) {
				return;
			}
			clearTimeout(this.mouseMode);
			var target = $(e.target);
			if(Math.abs(this.mouseEndX - this.mouseStartX) < 10 && Math.abs(this.mouseEndY - this.mouseStartY) < 10) {
				this.model.guess(target.attr('data-x'), target.attr('data-y'), 2);
				this.render();
			}
		},

		solve: function() {
			if(this.model.get('complete')) {
				return;
			}

			var state = this.model.get('state');
			var hintsX = this.model.get('hintsX');
			var hintsY = this.model.get('hintsY');

			var perfect = true;
			var solutionX = this.model.getHintsX(state);
			var solutionY = this.model.getHintsY(state);

			for(var i = 0; i < hintsX.length; i++) {
				if(hintsX[i].length !== solutionX[i].length) {
					perfect = false;
					break;
				}
				for(var j = 0; j < hintsX[i].length; j++) {
					if(Math.abs(hintsX[i][j]) !== solutionX[i][j]) {
						perfect = false;
						break;
					}
				}
			}

			for(var i = 0; i < hintsY.length; i++) {
				if(hintsY[i].length !== solutionY[i].length) {
					perfect = false;
					break;
				}
				for(var j = 0; j < hintsY[i].length; j++) {
					if(Math.abs(hintsY[i][j]) !== solutionY[i][j]) {
						perfect = false;
						break;
					}
				}
			}

			this.model.set({
				complete: true,
				perfect: perfect,
				hintsX: hintsX,
				hintsY: hintsY
			});

			this.render();
		},

		render: function() {
			var progress = this.model.get('guessed') / this.model.get('total') * 100;
			$('#progress').text(progress.toFixed(1) + '%');

			if(this.model.get('darkMode')) {
				$('body').addClass('dark');
			} else {
				$('body').removeClass('dark');
			}

			if(this.model.get('complete')) {
				$('#solve').prop('disabled', true);
				$('#puzzle').addClass('complete');
				if(this.model.get('perfect')) {
					$('#progress').addClass('done');
					$('#puzzle').addClass('perfect');
				}
			}

			var state = this.model.get('state');
			var hintsX = this.model.get('hintsX');
			var hintsY = this.model.get('hintsY');

			var hintsXText = [];
			var hintsYText = [];
			if(this.model.get('easyMode') || this.model.get('complete')) {
				for(var i = 0; i < hintsX.length; i++) {
					hintsXText[i] = [];
					for(var j = 0; j < hintsX[i].length; j++) {
						if(hintsX[i][j] < 0) {
							hintsXText[i][j] = '<em>' + Math.abs(hintsX[i][j]) + '</em>';
						} else {
							hintsXText[i][j] = '<strong>' + hintsX[i][j] + '</strong>';
						}
					}
				}
				for(var i = 0; i < hintsY.length; i++) {
					hintsYText[i] = [];
					for(var j = 0; j < hintsY[i].length; j++) {
						if(hintsY[i][j] < 0) {
							hintsYText[i][j] = '<em>' + Math.abs(hintsY[i][j]) + '</em>';
						} else {
							hintsYText[i][j] = '<strong>' + hintsY[i][j] + '</strong>';
						}
					}
				}
			} else {
				for(var i = 0; i < hintsX.length; i++) {
					hintsXText[i] = [];
					for(var j = 0; j < hintsX[i].length; j++) {
						hintsXText[i][j] = '<strong>' + Math.abs(hintsX[i][j]) + '</strong>';
					}
				}
				for(var i = 0; i < hintsY.length; i++) {
					hintsYText[i] = [];
					for(var j = 0; j < hintsY[i].length; j++) {
						hintsYText[i][j] = '<strong>' + Math.abs(hintsY[i][j]) + '</strong>';
					}
				}
			}

			var html = '<table>';
			html += '<tr><td class="key"></td>';
			for(var i = 0; i < state[0].length; i++) {
				html += '<td class="key top">' + hintsYText[i].join('<br/>') + '</td>';
			}
			html += '</tr>';
			for(var i = 0; i < state.length; i++) {
				html += '<tr><td class="key left">' + hintsXText[i].join('') + '</td>';
				for(var j = 0; j < state[0].length; j++) {
					html += '<td class="cell s' + Math.abs(state[i][j]) + '" data-x="' + i + '" data-y="' + j + '"></td>';
				}
				html += '</tr>';
			}
			html += '</table>';

			$('#puzzle').html(html);

			var side = (600 - (state[0].length * 5)) / state[0].length;
			$('#puzzle td.cell').css({
				width: side,
				height: side,
				fontSize: Math.ceil(200 / state[0].length)
			});
		}
	});

	new PuzzleView({model: new PuzzleModel()});

});

function localStorageSupport() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}
