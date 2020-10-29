/**
* this is a class for generate game results either star or score.
* @class
* @author     NejiElYahya
*/

var ResultGame = function(){

}


ResultGame.prototype.init = function(current_settings) {
	console.log("init");
	var $this = this;
	$this.gameMultiChoice = new GameMultichoice();
	$this.current_settings = current_settings;
	$this.video_path = 'assets/video/result/';
	$this.play_video_interval_result; //variabel interval play video
	$this.game_data = game.game_data;
	$.get("config/setting_result_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.ldata = e;
		$this.score = e["score"];
		$this.background = e["background"];
		$this.background_lose = e["background_lose"];
		$this.win = e["win"];
		$this.lose = e["lose"];
		$this.setResult();
	},'json');
};

ResultGame.prototype.setResult = function() {
	var $this = this;

	//hide header
	$(".header").hide();

	// remove jquery mobile
	$("html").removeClass("ui-mobile");
	// game.audio.audioBackground.pause();
	// game.audio.audioMotor.pause();
		
	/*comment by elim*/
	let modeTest = 0;
	var score;
	var game_quiz;

	//clear interval
	// console.log("timer_card: ",$this.gameMultiChoice);
	// if($this.gameMultiChoice != undefined){
	// 	clearInterval($this.gameMultiChoice);
	// }

	if(modeTest == 1){
		score = 80;
	}else{
		game_quiz = game.scorm_helper.getQuizResult(["game_slide_2"]);
		// game_quiz = {
		// 	"score":9,
		// 	"total_soal":10
		// };
		// console.log(game_quiz);
		// console.log(game.game_data);
		
		if(game_quiz["score"] == 0){
			score = 0;
		}else{
			console.log(game_quiz["score"]);
			console.log(game.total_soal);
			console.log(game.max_score);
			score = parseInt(game_quiz["score"])/parseInt(game_quiz["total_soal"])*game.max_score;
		}
	}

	console.log(score);
	console.log(game.min_score);
	/*end comment by elim*/
	// count score range 0-100 for save to cmi.raw.score
	var count = score/game.max_score*100;
	// for score in text
	$(".result_score").html(Math.round(score));
	if($this.score){
		$(".star_wrapper").hide();
		$(".score_wrapper").show();
	}else{
		$(".star_wrapper").show();
		$(".score_wrapper").hide();
	}
	// save score to to cmi.raw.score
	game.scorm_helper.sendResult(Math.round(count));
	// set duration and save to scorm
	game.scorm_helper.setDuration();
	//hide score
	// $(".star_score_wrapper").hide();
	//hide text_wrapper
	// $(".button_text_wrapper .text_wrapper").hide();

	// if score larger than minimum grade
	if(Math.round(score) >= game.min_score){
		// set to win
		// $(".slider-content").css({"background":"url('assets/image/result/bg-win.png') no-repeat center","background-size":"cover"});
		
		//validasi set background using gif or video
		if($this.ldata['background_video'] != undefined && $this.ldata['background_video'] != ""){
	        let $clone = $("#body");
	        let src = $this.ldata['background_video'];
	        $this.setVideo($clone, src);
	    }else{
	        $(".result_wrapper").css("background","url(assets/image/result/"+$this.background+") no-repeat center / cover");
	    }
		
		//play audio
        if($this.win["backsound"] != undefined && $this.win["backsound"] != ""){
            let looping = false;
            game.playBacksound($this.win["backsound"], looping);
        }else{
            game.audio.audioMenang.play();
        }
		
		game.scorm_helper.setStatus("passed");
		$(".result_wrapper").addClass("win");
		$(".ribbon_result img").attr("src","assets/image/result/"+$this.win["ribbon"]);
		console.log($this.win);
		$(".ribbon_result .text_ribbon_result").html($this.win["ribbon_text"]);
		$(".score_wrapper").css($this.win["score_css"]);
		$(".text_wrapper").html($this.win["description"]["text"]);
		$(".text_wrapper").css($this.win["description"]["css"]);
		$(".button.btn-game").html($this.win["button"]["text"]);
		$(".button.btn-game").css($this.win["button"]["button_css"]);
		$(".button.btn-game").addClass("btn-next-result");
		// go to next slide
		$(".btn-next-result").click(function(e){
			let src = "assets/audio/sound_button_result.wav";
			game.audio.audio_dynamic(src).play();
			//clear interval play video
            // clearInterval($this.play_video_interval_result);

			// game.audio.audioButton.play();
			//$(this).off();
			// try{
	  //           var btn_back = parent.top.document.getElementsByClassName("back-button")[0];
	  //           btn_back.click();
	  //       }
	  //       catch(e){
	  //           top.window.close();
	  //       }
	  		game.setSlide($this.win["button"]["gotoSlide"]);
		});
	}
	else{
		// set to lose
		// $(".slider-content").css({"background":"url('assets/image/result/bg-lose.png') no-repeat center","background-size":"cover"});
		
		//validasi set background using gif or video
		if($this.ldata['background_lose_video'] != undefined && $this.ldata['background_lose_video'] != ""){
	        let $clone = $("#body");
	        let src = $this.ldata['background_lose_video'];
	        $this.setVideo($clone, src);
	    }else{
	        $(".result_wrapper").css("background","url(assets/image/result/"+$this.background+") no-repeat center / cover");
	    }
		
		//play audio
        if($this.lose["backsound"] != undefined && $this.lose["backsound"] != ""){
            let looping = false;
            game.playBacksound($this.lose["backsound"], looping);
        }else{
            game.audio.audioKalah.play();
        }
		
		$(".result_wrapper").addClass("lose");
		$(".ribbon_result img").attr("src","assets/image/result/"+$this.lose["ribbon"]);
		$(".ribbon_result .text_ribbon_result").html($this.lose["ribbon_text"]);
        $(".score_wrapper").css($this.lose["score_css"]);
		$(".text_wrapper").html($this.lose["description"]["text"]);
		$(".text_wrapper").css($this.lose["description"]["css"]);

		if($this.lose["button_2"] != undefined){
			//set btn-game
			$(".btn-game").html($this.lose["button"]["text"]);
			$(".btn-game").css($this.lose["button"]["button_css"]);
			// $(".btn-game").addClass("btn-tryagain-result");
			if($this.lose["button"]["gotoSlide"] != undefined){
				$(".btn-game").unbind().click(function(){
					//set ldata quiz
					let src = "assets/audio/sound_button_result.wav";
					game.audio.audio_dynamic(src).play();

					console.log(game.scorm_helper.ldata);
					game.scorm_helper.ldata = {};
					console.log(game.scorm_helper.ldata);

					//set game_data
					// let arr_temp = {
					// 	"slide": 3,
					// 	"total_soal_current_slide": $this.game_data["total_soal_current_slide"]
					// }

					// $this.game_data = arr_temp;
					// game.game_data = $this.game_data;

					game.setSlide($this.lose["button"]["gotoSlide"]);
				});
			}

			$(".btn-game-2").html($this.lose["button_2"]["text"]);
			$(".btn-game-2").css($this.lose["button_2"]["button_css"]);
			$(".btn-game-2").addClass("btn-tryagain-result");
			$(".btn-game-2").show();
		}else{
			$(".button.btn-game").html($this.lose["button"]["text"]);
			$(".button.btn-game").css($this.lose["button"]["button_css"]);
			$(".button.btn-game").addClass("btn-tryagain-result");
		}
		// click try again button
		$(".btn-tryagain-result").click(function(e){
			game.scorm_helper.setStatus("failed");

			//clear interval play video
            clearInterval($this.play_video_interval_result);

			// game.audio.audioButton.play();
			let src = "assets/audio/sound_button_result.wav";
			game.audio.audio_dynamic(src).play();
			//$(this).off();
	  		game.setSlide($this.win["button"]["gotoSlide"]);
		});
	}

	// set star
	var flag=0;
	var count_star=0;

	var time_star = setInterval(function() {
		count_star++;
		// console.log(count_star);
		// console.log(game.max_score);
		if(count_star<=game.max_score){
			if(count_star<=score){
				$(".star_wrapper .star:nth-child("+count_star+")").addClass("active");
			}
			$(".star_wrapper .star:nth-child("+count_star+")").fadeIn(1000);
		}
		else{
			clearInterval(time_star);
		}
	},200);
};


ResultGame.prototype.setVideo = function($clone, src) {
    // console.log("setVideo");
    var $this = this;
    // console.log($("#video").find("source"));
    // console.log($this.video_path+src);
    $("#video").find("source").attr("src",$this.video_path+src);
    // console.log($(".img_video"));
    $(".img_video").hide();
    $("#video")[0].load();

    game.showLoading();
    // alert("test");
    $("#video").on("canplay",function(e){
    	game.hideLoading();
        $this.playVideo();

        $("#video").unbind().on("ended",function(e){
            $(this).off();
            // $this.pauseVideo();

            //call function set video, to call again this video
            // $this.play_video_interval_result = setInterval(function() {
            //     $this.playVideo();
            // },200);

            $this.playVideo_loop();
        });
    });
};

ResultGame.prototype.playVideo = function() {
    var $this = this;
    $("#video")[0].play();
};

ResultGame.prototype.playVideo_loop = function() {
    var $this = this;
    // console.log(/*$("#video")[0]*/);

    $("#video")[0].loop = true;
    $("#video")[0].play();
};

ResultGame.prototype.pauseVideo = function() {
    var $this = this;
    $("#video")[0].pause();
};