/*
new plugin for grid task
 */


jsPsych.plugins['grid-task'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'grid-task',
    description: '',
    parameters: {
      grid_size: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Grid size',
        array: false,
        default: 25,
        description: 'Number of tiles in grid',
      },
      pattern_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Pattern duration',
        default: 2000,
        description: 'How long to show the to-be-remembered pattern',
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      submit_button: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Submit',
        array: false,
        description: 'Label of the button to submit.'
      },
      start_button: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Start',
        array: false,
        description: 'Label of the button to start.'
      },
      exit_button: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Exit',
        array: false,
        description: 'Label of the button to exit.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    var html = '<div style="margin: 100px 0px;">';
    html += '<div>' + trial.stimulus + '</div>';

    html += '<div id="board"></div>';


    if (trial.prompt !== null){
      html += trial.prompt;
    }






    var tile_flipped=0;
    var generated_tile_ids=[];
    var user_input_tile_ids=[];
    var grid_size=25;
    var grid_fill='blue';

    var right_answer='Right';
    var almost_answer='Almost';
    var wrong_answer='Wrong';
    var num_correct=0; //score
    var num_total=0;

    var high_loading=6;
    var low_loading=3;

    var feedback_delay=200;
    var reset_delay=1000;

    /*
    Randomly generates the to-be-remembered pattern
    TODO: Only choose cells that haven't been chosen before and are neighbors of
     ones that have been chosen. The first cell is chosen randomly.
     - we don't have to do that
     - easy pattern- 3x3 grid,  make the pattern a straight line
     - option: hard-code the original patterns, mirrors, and rotations (24 loads total)
          see: xhp paper
          we want to hard code / replicate the original patterns
    */
    function generate_random_pattern() {
    	var i = grid_size, j;
    	//TODO: loading as param
    	var loading = high_loading;
    	while(generated_tile_ids.length < loading) {
    		j = Math.floor(Math.random() * grid_size);
    		// valuex = 'tile_' + j;
    		var index = generated_tile_ids.indexOf(j);
    		if (index == -1) {
    			generated_tile_ids.push(j);
    		}
    	}
    }

    /*
    Toggles the tile
    */
    function flip() {
      // t.stopPropagation(); //?
      console.log("in flip()");
      var ids = this.id.slice(5);

      if (this.style.background == grid_fill) { // to unclick
        var index = user_input_tile_ids.indexOf(ids);
        if (index >= 0 ) {
          user_input_tile_ids.splice(index, 1);
          tile_flipped -= 1;
          this.style.background = '';
        }
      } else { // to click
        tile_flipped += 1;
        user_input_tile_ids.push(ids);
        this.style.background = grid_fill;
      }
    }



    /*
    Initializes a new grid, generates new pattern, displays the pattern
    */
    function newBoard() {
    	// console.log("here");
    	var output = '', j;
    	tile_flipped = 0;

    	document.getElementById("Verify_Test").disabled = true;
    	// document.getElementById("submit_db").disabled = true;

    	for(var i=0; i<grid_size; i++) {
        // NOTE: do not flip here
        	output += '<div id="tile_'+i+'" class="tile"></div>';
    	}
    	document.getElementById('board').innerHTML = output;
      // document.getElementById ("tile_1").addEventListener("click", flip(this), false);
    }


    function start_test() {

      console.log("starting test");

    	document.getElementById("Verify_Test").disabled = false;
    	// document.getElementById("submit_db").disabled = true;

    	generate_random_pattern();

      console.log("generated random pattern");

      // console.log("setting bg of all tiles to gray");
      // for(var i=0; i<grid_size; i++) {
      //   var tid = 'tile_' + i;
      //   document.getElementById(tid).style.background;
      // }

    	for(var i=0; i<6; i++) {
    		var ids = 'tile_'+ generated_tile_ids[i];
    		// var ids = generated_tile_ids[i];
    		var tile = document.getElementById(ids);
    //     Array.prototype.slice.call(document.getElementById(tile).attributes).forEach(function(item) {
    // console.log(item.name + ': '+ item.value);})
        // console.log("bg1: " + tile.style.background);
    		tile.style.background = grid_fill;
        // console.log("bg2: " + tile.style.background);
    	}

      console.log("colored in selected random tiles");
    	setTimeout(prepare_board_for_user_input, reset_delay);
    }

    //	exit the html page
    function test_done() {
     	document.getElementById("Verify_Test").disabled = false;
    	// document.getElementById("submit_db").disabled = false;
    	// history.go(-1);
    }

    /*
    Initializes a new grid, resets vars, gets user clicks
    */
    function prepare_board_for_user_input() {
      console.log("preparing board for user input");

    	var output = '', j;
    	tile_flipped = 0;

    	user_input_tile_ids = [];
    	document.getElementById('board').innerHTML = "";


    	for (var i=0; i<grid_size; i++) {
    		// output += '<div id="tile_'+i+'" onclick="flip(this)"></div>';
        var result = 'tile_' + i;
        // output += '<div id="tile_'+i+'"></div>';
        output += '<div id="'+ result +'" class="tile"></div>';
    	}
      document.getElementById('board').innerHTML = output;

      // FIXME flip on click not working
      console.log("waiting for clicks");
      // document.getElementById('tile_0').addEventListener('dblclick', console.log("dblclick registered"));
      for (var i=0; i<grid_size; i++) {
        var result = 'tile_' + i;
  //       Array.prototype.slice.call(document.getElementById(result).attributes).forEach(function(item) {
	// console.log(item.name + ': '+ item.value);});
        var tile = document.getElementById(result);
        tile.addEventListener('click', flip);
      }
    }

    /*
    resets all vars
    */
    function reset_memory_board(){
    	tile_flipped = 0;
    	generated_tile_ids = [];
    	user_input_tile_ids = [];

    	document.getElementById('board').innerHTML = "";
    	newBoard();
    }

    /*
    Checks if user input is right, almost, or wrong
    Increments num_correct and num_total appropriately
    */
    function verify_result() {

      document.getElementById("Verify_Test").disabled = true;
      // document.getElementById("submit_db").disabled = false;

    	var index, tile_value, num_wrong=0;

    	// count how many of user_input are hits, misses, false alarms
    	var hits=0, false_alarms=0, misses=0;
    	for (var i = 0; i < user_input_tile_ids.length; i++) {
    		tile_value = Number(user_input_tile_ids[i]);
    		// alert(tile_value);
    		index = generated_tile_ids.indexOf(tile_value);

    		if (index < 0) {
    			// alert("false_alarms");
    			false_alarms += 1;
    		} else {
    			// alert("hit");
    			hits += 1;
    		}
    	}
    	misses = generated_tile_ids.length - hits

      // TODO: keep track of hits/misses/falsealarms which is different

    	// update scores according to num_wrong
    	// 1 point for correct, 0.5 point for almost, 0 point for wrong
    	// num_wrong = misses + false_alarms; //FIXME scoring scheme--?
      // no need to keep track of response
    	num_wrong = Math.max(misses, false_alarms);
    	if (num_wrong == 0) {
    		verdict = right_answer;
    		change_score(1);
    	} else if (num_wrong == 1) {
    		verdict = almost_answer;
    		change_score(0.5);
    	} else {
    		verdict = wrong_answer;
    		change_score(0);
    	}
    	alert(verdict + "\nscore: " + num_correct + "\nnum_total: " + num_total);


    	// reset the board
    	setTimeout(reset_memory_board, 200);
    }

    /*
    Increment the num_correct and num_total according to round score
    1 point for correct, 0.5 point for almost, 0 point for wrong
    */
    function change_score(round_score) {
    	num_correct += round_score
    	num_total += 1
    }







    // add submit button

    html += '<input type="button" id="Start_Test" value="Start"/>';
    html += '<input type="button" id="Verify_Test" value="Submit"/>';
    html += '<input type="button" id="Exit" value="Exit"/>';

    // html += '<button id="Start_Test" type="button" onclick ="start_test()">'+trial.start_button+'</button>';
    // html += '<button id="Verify_Test" type="button" onclick="verify_result()">'+trial.submit_button+'</button>';
    // html += '<button id="Exit" type="button" onclick ="test_done()">'+trial.exit_button+'</button>';

    // start_test();
    display_element.innerHTML = html;

    newBoard();
    // start_test();
    // prepare_board_for_user_input();
    start_test();
    document.getElementById ("Start_Test").addEventListener("click", start_test, false);
    document.getElementById ("Verify_Test").addEventListener("click", verify_result, false);
    document.getElementById ("Exit").addEventListener("click", test_done, false);





    var response = {
      rt: null,
      response: null,
      veredict: null,
    };

    // display_element.querySelector('#jspsych-html-slider-response-next').addEventListener('click', function() {
    //   // measure response time
    //   var endTime = (new Date()).getTime();
    //   response.rt = endTime - startTime;
    //   response.response = display_element.querySelector('#jspsych-html-slider-response-response').value;
    //
    //   if(trial.response_ends_trial){
    //     end_trial();
    //   } else {
    //     display_element.querySelector('#jspsych-html-slider-response-next').disabled = true;
    //   }
    //
    // });

    function end_trial(){
      jsPsych.pluginAPI.clearAllTimeouts();

      // save data
      var trialdata = {
        "rt": response.rt,
        "response": response.response,
        "stimulus": trial.stimulus
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    }

    // if (trial.stimulus_duration !== null) {
    //   jsPsych.pluginAPI.setTimeout(function() {
    //     display_element.querySelector('#jspsych-html-slider-response-stimulus').style.visibility = 'hidden';
    //   }, trial.stimulus_duration);
    // }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
