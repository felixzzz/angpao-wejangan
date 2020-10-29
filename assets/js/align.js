var Align = function(){
	
}

Align.prototype.init = function(current_settings) {
	var $this = this;
	$this.current_settings = current_settings;
	$this.switch_on = 0;
	$this.konslet = 0;
	$.get("config/setting_align_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.backgroundgame = e["backgroundgame"];
		$this.background = e["background"];
		$this.switch = e["switch"];
		$this.soal = e["list_question"];
		$this.setTutorial();
		$this.setPadding();
		$this.setData();
	},"json");
};

Align.prototype.setTutorial= function() {
	var $this = this;
	if(game.scorm_helper.getSingleData("tutorial") == undefined){
		$("#tutorial .tutorial.align").addClass("done");
	  	$("#tutorial .tutorial.align").addClass("active");
	  	$("#tutorial").modal({backdrop: 'static',keyboard: true,show: true});
	  	$("#tutorial .tutorial.align").find("div").first().slick({
	      	dots: true,
	      	infinite: false,
	      	speed: 500,
	      	prevArrow: false,
	      	nextArrow: false
	  	});
	  	$("#tutorial .tutorial.align").find(".start-game").click(function(e){
	    	$("#tutorial").modal('hide');
	    	game.scorm_helper.setSingleData("tutorial",true);
	  	});
  	}
};

Align.prototype.setPadding = function() {
	var $this = this;
	$(".align_wrapper").css("background","url(assets/image/align/"+$this.backgroundgame+") no-repeat center / cover");
	if($(window).outerWidth()*2 < $(window).outerHeight()){
		$(".align_wrapper").css("padding","3.183023872679045vh 2.1220159151193636vh");
	}else if($(window).outerWidth() <= 320){
		$(".align_wrapper").css("padding","2.6525198938992043vh 5.305039787798409vh 3.183023872679045vh");
	}else{
		$(".align_wrapper").css("padding","3.183023872679045vh");
	}
};

Align.prototype.getQuestion = function() {
	var $this = this;
	var arr_quest = [];
	var arr_rand = [];
	var returnQuest = [];
	var bank_soal = [];

	for (var i = 0; i < $this.soal.length; i++) {
		arr_quest.push(i);
	}

	returnQuest = arr_quest;

	return returnQuest;
};

Align.prototype.setData = function() {
	var $this = this;
	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
	if(ldata == undefined || ldata["answer"]== undefined || ldata["answer"]== null || ldata["answer"].length < $this.soal.length){
		var sdata = game.scorm_helper.setQuizData("game_slide_"+$this.current_settings["slide"],$this.getQuestion(),ldata);
		$this.list_question = sdata["list_question"];
		$this.answer = sdata["answer"];
		$this.curr_soal = sdata["answer"].length;
		$this.setGame();
	}else{
		game.nextSlide();
	}
};

Align.prototype.setGame = function() {
	var $this = this;
	$( window ).resize(function() {
		$this.setPadding();
	});
	game.audio.audioBackground.volume = 0;
	game.audio.audioBackground.loop = true;
	game.audio.audioBackground.play();
	$(".switch").each(function(index,value){
		if(parseInt($(this).attr("index")) == $this.switch[index]["index"]){
			$(this).css($this.switch[index]["position"]);
		}
	});
	$this.setQuestion();
};

Align.prototype.setQuestion = function() {
	var $this = this;
	$(".align_wrapper").removeClass("right");
	$(".align_wrapper").removeClass("wrong");
	$(".bg_soal").attr("src","assets/image/align/"+$this.background);
	$(".button_wrapper").find("img").attr("src","assets/image/align/Submit-Button.png");
	$(".text_soal").html($this.soal[$this.list_question[$this.curr_soal]]["text"]);
	$(".answer").html("");
	$(".switch").removeClass("active");
	$(".switch").attr("src","assets/image/align/Spark-Button-Off.png");
	$(".switch").click(function(){
		if($this.switch_on < 2){
			if($(this).hasClass("active")){
				$this.switch_on--;
				$(this).removeClass("active");
				$(this).attr("src","assets/image/align/Spark-Button-Off.png");
			}else{
				$this.switch_on++;
				$(this).addClass("active");
				$(this).attr("src","assets/image/align/Spark-Button-On.png");
			}
		}else{
			if($(this).hasClass("active")){
				$this.switch_on--;
				$(this).removeClass("active");
				$(this).attr("src","assets/image/align/Spark-Button-Off.png");
			}
		}
	});
	$(".choice").removeClass("right");
	$(".choice").removeClass("wrong");
	$(".choice").removeClass("active");
	$(".choice").find("img").attr("src","assets/image/align/Answer-Button-Inactive.png");
	$(".choice").click(function(){
		if($(this).hasClass("active")){
			$(this).removeClass("active");
			$(this).find("img").attr("src","assets/image/align/Answer-Button-Inactive.png");
			$(".answer").html("");
		}else{
			$(".choice").removeClass("active");
			$(".choice").find("img").attr("src","assets/image/align/Answer-Button-Inactive.png");
			$(this).addClass("active");
			$(this).find("img").attr("src","assets/image/align/Answer-Button-Active.png");
			$(".answer").html($this.soal[$this.list_question[$this.curr_soal]]["pilihan"][$(this).attr("index")]["text"]);
		}
	});
	$(".lamp").each(function(index,value){
		if(parseInt($(this).attr("index")) == $this.curr_soal){
			$(this).find("img").attr("src","assets/image/align/Question-Lamp-On.png");
		}else if($this.answer[index] == 1){
			$(this).find("img").attr("src","assets/image/align/Question-Lamp-Right.png");
		}else if($this.answer[index] == 0){
			$(this).find("img").attr("src","assets/image/align/Question-Lamp-Wrong.png");
		}
	});
	$(".button_wrapper").click(function(){
		game.audio.audioSubmit.play();
		$(this).off();
		$(this).find("img").attr("src","assets/image/align/Submit-Button-Pressed.png");
		$(".switch").off();
		$(".choice").off();
		$this.checkJawaban();
	});
};

Align.prototype.checkJawaban = function() {
	var $this = this;
	var answer = [];
	var index_answer = 0;
	var $cek = 0;
	$(".switch").each(function(){
		if($(this).hasClass("active")){
			answer.push(parseInt($(this).attr("index")));
		}
	});
	for(var i = 0; i < $this.soal[$this.list_question[$this.curr_soal]]["jawaban"].length; i++){
		var a = answer.sort();
		var b = $this.soal[$this.list_question[$this.curr_soal]]["jawaban"][i].sort();
		if(JSON.stringify(a) == JSON.stringify(b)){
			$cek = 1;
			index_answer = i;
		}
	}
	if($cek == 0){
		game.audio.audioSalah.play();
		game.scorm_helper.pushAnswer(0,$this.soal[$this.list_question[$this.curr_soal]]["text"]);
		$(".choice").addClass("wrong");
		$(".choice").find("img").attr("src","assets/image/align/Answer-Button-Wrong.png");
		$(".lamp[index='"+$this.curr_soal+"']").find("img").attr("src","assets/image/align/Question-Lamp-Wrong.png");
		$(".align_wrapper").addClass("wrong");
		$(".text_soal").html("ERROR!");
		$(".answer").html("HACKING FAILED!");
		$this.setAnimationShort();
	}else{
		game.audio.audioBenar.play();
		game.scorm_helper.pushAnswer(1,$this.soal[$this.list_question[$this.curr_soal]]["text"]);
		$(".choice[index='"+$this.soal[$this.list_question[$this.curr_soal]]["jawaban_choice"]+"']").addClass("right");
		$(".choice[index='"+$this.soal[$this.list_question[$this.curr_soal]]["jawaban_choice"]+"']").find("img").attr("src","assets/image/align/Answer-Button-Correct.png");
		$(".lamp[index='"+$this.curr_soal+"']").find("img").attr("src","assets/image/align/Question-Lamp-Right.png");
		$(".bg_soal").attr("src","assets/image/align/"+$this.soal[$this.list_question[$this.curr_soal]]["gambar_jawaban"][index_answer]);
		$(".align_wrapper").addClass("right");
		$(".text_soal").html("CORRECT!");
		$(".answer").html("ACCESS GRANTED!");
		setTimeout(function(e){
			$this.showAnimationRightIn();
		},1500);
	}
	$this.curr_soal++;
	$this.switch_on = 0;
};

Align.prototype.setAnimationShort = function() {
	var $this = this;
	var index = 1;
	var timeout = setInterval(function(e){
		if(index < 7){
			$(".stage_wrapper .short").remove();
			$(".stage_wrapper").append("<img class='short' src='assets/image/align/Sprite-Anim-Electric-"+index+".png'>");
			index++;
		}else{
			$(".stage_wrapper .short").remove();
			clearInterval(timeout);
			$this.konslet++;
			if($this.konslet < 2){
				$this.setAnimationShort();
			}else{
				setTimeout(function(e){
					if($this.curr_soal < $this.soal.length){
						$this.setQuestion();
						$this.konslet = 0;
					}else{
						/*game.audio.audioBackground.pause();
						game.nextSlide();*/
						$this.showAnimationRightInComplete();
					}
				},500);
			}
		}
	},100);
};

Align.prototype.showAnimationRightIn = function() {
	var $this = this;
	$("#popupWinAlign").modal({backdrop: 'static',keyboard: true,show: true});
	$(".bg_feedback").css("left","-100%");
	$(".bg_feedback").animate({left:"50%"},{duration:500,specialEasing:"easeOut"});
	$(".cctv").css("left","-100%");
	$(".cctv").animate({left:"0%"},{duration:600,specialEasing:"easeOut"});
	$(".parent p").css("opacity","0");
	setTimeout(function(e){
		$(".parent p").animate({opacity:"1"},{duration:1000,easing:"linear"});
	},600);
	setTimeout(function(e){
		$this.showAnimationRightOut();
	},2000);
};

Align.prototype.showAnimationRightOut = function() {
	var $this = this;
	$(".parent p").animate({opacity:"0"},{duration:300,specialEasing:"easeIn"});
	setTimeout(function(e){
		$(".cctv").animate({left:"55%"},{duration:200,specialEasing:"easeIn"});
		$(".bg_feedback").animate({left:"175%"},{duration:500,specialEasing:"easeIn"});
		setTimeout(function(){
			$("#popupWinAlign").modal("hide");
			setTimeout(function(){
				if($this.curr_soal < $this.soal.length){
					$this.setQuestion();
					$this.konslet = 0;
				}else{
					/*game.audio.audioBackground.pause();
					game.nextSlide();*/
					$this.showAnimationRightInComplete();
				}
			},100);
		},500);
	},300);
};

Align.prototype.showAnimationRightInComplete = function() {
	var $this = this;
	$("#popupCompleteAlign").modal({backdrop: 'static',keyboard: true,show: true});
	$(".modal-backdrop.in").css({"opacity":"1"});
	$(".bg_feedback").css("left","-100%");
	$(".bg_feedback").animate({left:"50%"},{duration:500,specialEasing:"easeOut"});
	$(".cctv").css("left","-100%");
	$(".cctv").animate({left:"0%"},{duration:600,specialEasing:"easeOut"});
	$(".parent p").css("opacity","0");
	setTimeout(function(e){
		$(".parent p").animate({opacity:"1"},{duration:1000,easing:"linear"});
	},600);
	setTimeout(function(e){
		$this.showAnimationRightOutComplete();
	},2000);
};

Align.prototype.showAnimationRightOutComplete = function() {
	var $this = this;
	$(".parent p").animate({opacity:"0"},{duration:300,specialEasing:"easeIn"});
	setTimeout(function(e){
		$(".cctv").animate({left:"55%"},{duration:200,specialEasing:"easeIn"});
		$(".bg_feedback").animate({left:"175%"},{duration:500,specialEasing:"easeIn"});
		setTimeout(function(){
			$("#popupCompleteAlign").modal("hide");
		},500);
		game.audio.audioBackground.pause();
		game.nextSlide();
	},300);
};