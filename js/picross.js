$(function() {

	var PuzzleModel = Backbone.Model.extend({
		
		defaults: function() {
			return {
				dimensionX: 10,
				dimensionY: 10,
				solution: [],
				state: [],
				hintsX: [],
				hintsY: [],
				mistakes: 0,
				guessed: 0,
				total: 100,
				complete: false,
				seed: 0,
				easyMode: true	// show crossouts
			};
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
			
			for(var i = 0; i < this.get('dimensionX'); i++) {
				solution[i] = [];
				state[i] = [];
				for(var j = 0; j < this.get('dimensionY'); j++) {
					var random = Math.ceil(Math.random() * 2);
					solution[i][j] = random;
					total += (random - 1);
					state[i][j] = 0;
				}
			}
			
			var hintsX = [];
			var hintsY = [];
			
			for(var i = 0; i < this.get('dimensionX'); i++) {
				var streak = 0;
				hintsX[i] = [];
				for(var j = 0; j < this.get('dimensionY'); j++) {
					if(solution[i][j] == 1) {
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
			
			for(var j = 0; j < this.get('dimensionY'); j++) {
				var streak = 0;
				hintsY[j] = [];
				for(var i = 0; i < this.get('dimensionX'); i++) {
					if(solution[i][j] == 1) {
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
			
			this.set({
				solution: solution,
				state: state,
				hintsX: hintsX,
				hintsY: hintsY,
				mistakes: 0,
				guessed: 0,
				total: total,
				complete: false,
				seed: seed
			});
		},
		
		guess: function(x, y, guess) {
			var solution = this.get('solution')[x][y];
			var state = this.get('state');
			var hintsX = this.get('hintsX');
			var hintsY = this.get('hintsY');
			var mistakes = this.get('mistakes');
			var guessed = this.get('guessed');
			
			if(state[x][y] != 0) {
				// already guessed
				return;
			}
			
			if(solution == guess) {
				state[x][y] = guess;
			} else {
				state[x][y] = solution * -1;
				mistakes++;
			}
			
			if(solution == 2) {
				guessed++;
			}
			
			// cross out x -- left
			var tracker = 0;
			for(var i = 0; i < hintsX[x].length; i++) {
				while(Math.abs(state[x][tracker]) == 1) {
					tracker++;
				}
				if(state[x][tracker] == 0) {
					break;
				}
				var streak = hintsX[x][i];
				if(streak < 0) {
					tracker += Math.abs(streak);
					continue;
				}
				for(var j = 1; j <= streak; j++) {
					if(Math.abs(state[x][tracker]) == 2) {
						tracker++;
						if(j == streak && (tracker == state[0].length || Math.abs(state[x][tracker]) == 1)) {
							hintsX[x][i] = streak * -1;
						}
					} else {
						break;
					}
				}
			}
			// cross out x -- right
			tracker = state[0].length - 1;
			for(var i = hintsX[x].length - 1; i >= 0; i--) {
				while(Math.abs(state[x][tracker]) == 1) {
					tracker--;
				}
				if(state[x][tracker] == 0) {
					break;
				}
				var streak = hintsX[x][i];
				if(streak < 0) {
					tracker -= Math.abs(streak);
					continue;
				}
				for(var j = 1; j <= streak; j++) {
					if(Math.abs(state[x][tracker]) == 2) {
						tracker--;
						if(j == streak && (tracker == -1 || Math.abs(state[x][tracker]) == 1)) {
							hintsX[x][i] = streak * -1;
						}
					} else {
						break;
					}
				}
			}
			// cross out y -- top
			tracker = 0;
			for(var i = 0; i < hintsY[y].length; i++) {
				while(Math.abs(state[tracker][y]) == 1) {
					tracker++;
				}
				if(state[tracker][y] == 0) {
					break;
				}
				var streak = hintsY[y][i];
				if(streak < 0) {
					tracker += Math.abs(streak);
					continue;
				}
				for(var j = 1; j <= streak; j++) {
					if(Math.abs(state[tracker][y]) == 2) {
						tracker++;
						if(j == streak && (tracker == state.length || Math.abs(state[tracker][y]) == 1)) {
							hintsY[y][i] = streak * -1;
						}
					} else {
						break;
					}
				}
			}
			// cross out y -- bottom
			tracker = state.length - 1;
			for(var i = hintsY[y].length - 1; i >= 0; i--) {
				while(Math.abs(state[tracker][y]) == 1) {
					tracker--;
				}
				if(state[tracker][y] == 0) {
					break;
				}
				var streak = hintsY[y][i];
				if(streak < 0) {
					tracker -= Math.abs(streak);
					continue;
				}
				for(var j = 1; j <= streak; j++) {
					if(Math.abs(state[tracker][y]) == 2) {
						tracker--;
						if(j == streak && (tracker == -1 || Math.abs(state[tracker][y]) == 1)) {
							hintsY[y][i] = streak * -1;
						}
					} else {
						break;
					}
				}
			}
			
			this.set({
				state: state,
				hintsX: hintsX,
				hintsY: hintsY,
				mistakes: mistakes,
				guessed: guessed
			});
		}
		
	});
	
	var PuzzleView = Backbone.View.extend({
		
		el: $("body"),
		
		events: {
			"click #new": "newGame",
			"change #easy": "changeEasyMode",
			"change #dimensions": "changeDimensions",
			"mousedown": "clickStart",
			"mouseover td.cell": "mouseOver",
			"mouseout td.cell": "mouseOut",
			"mouseup": "clickEnd",
			"submit #customForm": "newCustom",
			"click #seed": function(e) { e.currentTarget.select(); },
			"click #customSeed": function(e) { e.currentTarget.select(); },
			"contextmenu": function(e) { e.preventDefault(); }
		},
		
		mouseStartX: -1,
		mouseStartY: -1,
		mouseEndX: -1,
		mouseEndY: -1,
		mouseMode: 0,
		
		initialize: function() {
			this.changeDimensions();
			this.model.reset();
			this.changeEasyMode();
			this.showSeed();
		},
		
		changeEasyMode: function(e) {
			var easyMode = $('#easy').attr('checked') !== undefined;
			this.model.set({easyMode: easyMode});
			this.render();
		},
		
		changeDimensions: function(e) {
			var dimensions = $('#dimensions').val();
			dimensions = dimensions.split('x');
			this.model.set({dimensionX: dimensions[1]});
			this.model.set({dimensionY: dimensions[0]});
		},
		
		_newGame: function(customSeed) {
			$('#puzzle').removeClass('complete');
			$('#progress').removeClass('done');
			$('#mistakes').removeClass('error');
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
			
			if(this.mouseMode == 0) {
				$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + '][data-y=' + endY + ']').addClass('hover');
				return;
			}
			
			var startX = this.mouseStartX;
			var startY = this.mouseStartY;
			
			if(startX == -1 || startY == -1) {
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
			if(this.mouseMode == 0) {
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
			this.checkCompletion();
			this.render();
		},
		
		clickArea: function(endX, endY, guess) {
			var startX = this.mouseStartX;
			var startY = this.mouseStartY;
			
			if(startX == -1 || startY == -1) {
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
		
		checkCompletion: function() {
			if(this.model.get('complete')) {
				return;
			}
			
			var guessed = this.model.get('guessed');
			var total = this.model.get('total');
			
			if(guessed == total) {
				var hintsX = this.model.get('hintsX');
				var hintsY = this.model.get('hintsY');
				
				for(var i = 0; i < hintsX.length; i++) {
					for(var j = 0; j < hintsX[i].length; j++) {
						hintsX[i][j] = Math.abs(hintsX[i][j]) * -1;
					}
				}
				for(var i = 0; i < hintsY.length; i++) {
					for(var j = 0; j < hintsY[i].length; j++) {
						hintsY[i][j] = Math.abs(hintsY[i][j]) * -1;
					}
				}
				
				this.model.set({
					complete: true,
					hintsX: hintsX,
					hintsY: hintsY
				});
				$('#puzzle').addClass('complete');
				$('#progress').addClass('done');
			}
		},
		
		render: function() {
			var mistakes = this.model.get('mistakes');
			$('#mistakes').text(mistakes);
			if(mistakes > 0) {
				$('#mistakes').addClass('error');
			}
			
			var progress = this.model.get('guessed') / this.model.get('total') * 100;
			$('#progress').text(progress.toFixed(1) + '%');
			
			var state = this.model.get('state');
			var hintsX = this.model.get('hintsX');
			var hintsY = this.model.get('hintsY');
			
			var hintsXText = [];
			var hintsYText = [];
			if(this.model.get('easyMode')) {
				for(var i = 0; i < hintsX.length; i++) {
					hintsXText[i] = [];
					for(var j = 0; j < hintsX[i].length; j++) {
						if(hintsX[i][j] < 0) {
							hintsXText[i][j] = '<em>' + Math.abs(hintsX[i][j]) + '</em>';
						} else {
							hintsXText[i][j] = hintsX[i][j];
						}
					}
				}
				for(var i = 0; i < hintsY.length; i++) {
					hintsYText[i] = [];
					for(var j = 0; j < hintsY[i].length; j++) {
						if(hintsY[i][j] < 0) {
							hintsYText[i][j] = '<em>' + Math.abs(hintsY[i][j]) + '</em>';
						} else {
							hintsYText[i][j] = hintsY[i][j];
						}
					}
				}
			} else {
				for(var i = 0; i < hintsX.length; i++) {
					hintsXText[i] = [];
					for(var j = 0; j < hintsX[i].length; j++) {
						hintsXText[i][j] = Math.abs(hintsX[i][j]);
					}
				}
				for(var i = 0; i < hintsY.length; i++) {
					hintsYText[i] = [];
					for(var j = 0; j < hintsY[i].length; j++) {
						hintsYText[i][j] = Math.abs(hintsY[i][j]);
					}
				}
			}
			
			var html = '<table>';
			html += '<tr><td></td>';
			for(var i = 0; i < state[0].length; i++) {
				html += '<td class="key top">' + hintsYText[i].join('<br/>') + '</td>';
			}
			html += '</tr>';
			for(var i = 0; i < state.length; i++) {
				html += '<tr><td class="key left">' + hintsXText[i].join('&nbsp;') + '</td>';
				for(var j = 0; j < state[0].length; j++) {
					html += '<td class="cell s' + Math.abs(state[i][j]) + '" data-x="' + i + '" data-y="' + j + '">';
					if(state[i][j] < 0) {
						html += 'X'; //&#9785;
					}
					html += '</td>';
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
