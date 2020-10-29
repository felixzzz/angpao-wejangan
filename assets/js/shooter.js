var Shooter = function(){
	
}

Shooter.prototype.init = function(current_settings) {
	var $this = this;
	$this.current_settings = current_settings;
	$this.curr_soal = 0;
	$this.choice = $(".choice").first().clone();
	$this.feedback_img = $(".feedback_image img").first().clone();
	$.get("config/setting_shooter_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.settings = e["settings"];
		$this.heart = e["list_heart"];
		$this.soal = e["list_soal"];
		$this.isRandom = e["settings"]["random"];
		$this.setTutorial();
	},"json");
};

Shooter.prototype.setTutorial = function() {
	var $this = this;
	if(game.scorm_helper.getSingleData("tutorial") == undefined){
		$("#tutorial .tutorial.smart").addClass("done");
	  	$("#tutorial .tutorial.smart").addClass("active");
	  	$("#tutorial").modal({backdrop: 'static',keyboard: true,show: true});
	  	$("#tutorial .tutorial.smart").find("div").first().slick({
	      	dots: true,
	      	infinite: false,
	      	speed: 500,
	      	prevArrow: false,
	      	nextArrow: false
	  	});
	  	$("#tutorial .tutorial.smart").find(".start-game").click(function(e){
	    	$("#tutorial").modal('hide');
	    	game.scorm_helper.setSingleData("tutorial",true);
	    	$this.setHeart();
	    	$this.checkData();
	  	});
  	}else{
  		$this.setHeart();
  		$this.checkData();
  	}
};

Shooter.prototype.getQuestion = function() {
	var $this = this;
	var arr_quest = [];
	var arr_rand = [];
	var returnQuest = [];
	var bank_soal = [];

	for (var i = 0; i < $this.soal.length; i++) {
		arr_quest.push(i);
	}

	if($this.isRandom == true){
		do{
			var rand = Math.ceil(Math.random()*(arr_quest.length-1));
			arr_rand.push(arr_quest[rand]);
			arr_quest.splice(rand,1);
		}while(arr_quest.length>0);
		for(var i = 0; i < $this.settings["num_quest"]; i++){
			console.log(arr_rand[i]);
			bank_soal.push(arr_rand[i]);
		}
		returnQuest = bank_soal;
	}
	else{
		returnQuest = arr_quest;
	}

	return returnQuest;
};

Shooter.prototype.setHeart = function() {
	var $this = this;
	if(game.scorm_helper.getSingleData("heart") != undefined){
		$this.heart_now = game.scorm_helper.getSingleData("heart");
	}else{
		$this.heart_now = $this.heart.length-1;
	}
	
	if($this.heart_now < 0){
		game.nextSlide();
	}else{
		$(".heart_wrapper").animate({"width":"25%"},{duration:200,specialEasing:"easeIn",complete:function(){
			$(".heart_wrapper").find("img").attr("src","assets/image/shooter/"+$this.heart[$this.heart_now]);
			$(".heart_wrapper").animate({"width":"20%"},{duration:200,specialEasing:"easeOut"});
		}});
	}
};

Shooter.prototype.checkData = function() {
	var $this = this;
	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
	if(ldata == undefined || ldata["answer"]== undefined || ldata["answer"]== null || ldata["answer"].length < $this.soal.length){
		var sdata = game.scorm_helper.setQuizData("game_slide_"+$this.current_settings["slide"],$this.getQuestion(),ldata);
		$this.list_question = sdata["list_question"];
		$this.curr_soal = sdata["answer"].length;
		$this.setData();
	}else{
		game.nextSlide();
	}
};

Shooter.prototype.setData = function() {
	var $this = this;
	game.audio.audioBackground.src = "assets/audio/"+$this.soal[$this.list_question[$this.curr_soal]]["audio"];
	//game.audio.audioBackground.volume = 0;
	game.audio.audioBackground.play();
	game.audio.audioBackground.loop = true;
	$(".smart_wrapper").html("");
	$(".feedback_image").html("");
	$(".shoot_wrapper").css("background","url(assets/image/shooter/"+$this.soal[$this.list_question[$this.curr_soal]]["background"]+") no-repeat center / cover");
	$(".text_shooter").html($this.soal[$this.list_question[$this.curr_soal]]["title"]);
	$(".answer_shooter").html($this.soal[$this.list_question[$this.curr_soal]]["text"]);
	for(var i = 0; i < $this.soal[$this.list_question[$this.curr_soal]]["position"].length; i++){
		var clone = $this.choice.clone();
		$(clone).addClass($this.soal[$this.list_question[$this.curr_soal]]["type"]);
		$(clone).css($this.soal[$this.list_question[$this.curr_soal]]["position"][i]["position"]);
		$(clone).attr("index",$this.soal[$this.list_question[$this.curr_soal]]["position"][i]["index"]);
		$(clone).find("img").attr("src","assets/image/shooter/"+$this.soal[$this.list_question[$this.curr_soal]]["position"][i]["image"]);
		$(".smart_wrapper").append(clone);
	}
	for(var i = 0; i < $this.soal[$this.list_question[$this.curr_soal]]["feedback_image"].length; i++){
		var clone = $this.feedback_img.clone();
		$(clone).attr("index",$this.soal[$this.list_question[$this.curr_soal]]["feedback_image"][i]["index"]);
		$(clone).attr("src","assets/image/shooter/"+$this.soal[$this.list_question[$this.curr_soal]]["feedback_image"][i]["image"]);
		$(".feedback_image").append(clone);
	}
	$this.settingChoice();
}

Shooter.prototype.settingChoice = function() {
	var $this = this;
	$(".choice").click(function(){
		game.audio.audioLock.play();
		if($this.soal[$this.list_question[$this.curr_soal]]["type"] == "mc"){
			$(".choice").removeClass("active");
			$(".choice").find(".target").remove();
			$(this).addClass("active");
			$(this).append("<img class='target' src='assets/image/shooter/Tombol_Bidik.png' style='position: absolute;width: 100%;top: 0;left: 0;'>");
		}else if($this.soal[$this.list_question[$this.curr_soal]]["type"] == "mmc"){
			if(!$(this).hasClass("active")){
				$(this).addClass("active");
				$(this).append("<img class='target' src='assets/image/shooter/Tombol_Bidik.png' style='position: absolute;width: 100%;top: 0;left: 0;'>");
			}else{
				$(this).removeClass("active");
				$(this).find(".target").remove();
			}
		}
	});
	$(".hide_button").click(function(){
		$(this).off();
		$(".hand_wrapper").animate({"bottom":"5%"},{duration:100,specialEasing:"easeIn"});
		$(".hand_wrapper").animate({"bottom":"0%"},{duration:500,specialEasing:"easeOut"});
		$(".feedback_image").animate({"backgroundColor":"#FFF"},{duration:100,specialEasing:"easeIn"});
		$(".feedback_image").animate({"backgroundColor":"transparent"},{duration:500,specialEasing:"easeOut"});
		$(".choice").off();
		$this.cekJawabn();
	});
};

Shooter.prototype.cekJawabn = function() {
	var $this = this;
	var $flag = 0;
	var count = 0;
	$(".choice").each(function(){
		if($(this).hasClass("active")){
			game.audio.audioShoot.play();
			$(this).removeClass("active");
			$(this).find(".target").remove();
			var $cek=0;
			for (var i = 0; i < $this.soal[$this.list_question[$this.curr_soal]]["jawaban"].length; i++) {
				if($this.soal[$this.list_question[$this.curr_soal]]["jawaban"][i] == $(this).attr("index")){
					$cek=1;
					break;
				}
			}
			if($cek == 0){
				$flag=1;
				$(this).addClass("wrong");
			}
			else{
				count++;
				$(this).addClass("right");
			}
		}
		for (var i = 0; i < $this.soal[$this.list_question[$this.curr_soal]]["jawaban"].length; i++) {
			if($this.soal[$this.list_question[$this.curr_soal]]["jawaban"][i] == $(this).attr("index")){
				var index_choice = $(this).attr("index");
				$(".feedback_image").find("img").each(function(){
					if($(this).attr("index") == index_choice){
						$(this).show();
					}
				});
				$(this).addClass("right");
			}
		}
	});
	if(count != $this.soal[$this.list_question[$this.curr_soal]]["jawaban"].length){
		$flag = 1;
	}
	$(".question_wrapper").hide();
	$(".feedback_wrapper").removeClass("right");
	$(".feedback_wrapper").removeClass("wrong");
	$(".feedback_wrapper").show();
	$(".button_wrapper").show();
	if($flag == 0){
		setTimeout(function(e){
			game.audio.audioBenar.play();
		},300);
		game.scorm_helper.pushAnswer(1,$this.soal[$this.list_question[$this.curr_soal]]["title"]);
		$(".feedback_wrapper").addClass("right");
		$(".title_feedback").html("Jawaban Kamu Benar");
		if($this.soal[$this.list_question[$this.curr_soal]]["feedback_benar"]){
			$(".text_feedback").html($this.soal[$this.list_question[$this.curr_soal]]["feedback_benar"]);
			$(".text_feedback").show();
		}else{
			$(".text_feedback").hide();
		}
	}else{
		setTimeout(function(e){
			game.audio.audioSalah.play();
		},300);
		game.scorm_helper.pushAnswer(0,$this.soal[$this.list_question[$this.curr_soal]]["title"]);
		$(".feedback_wrapper").addClass("wrong");
		$(".title_feedback").html("Jawaban Kamu Salah");
		if($this.soal[$this.list_question[$this.curr_soal]]["feedback_salah"]){
			$(".text_feedback").html($this.soal[$this.list_question[$this.curr_soal]]["feedback_salah"]);
			$(".text_feedback").show();
		}else{
			$(".text_feedback").hide();
		}
		game.scorm_helper.setSingleData("heart",$this.heart_now-1);
		setTimeout(function(){
			$this.setHeart();
		},600);
	}
	$this.curr_soal++;
	$(".next_game").click(function(e){
		$(this).off();
		if($this.curr_soal < $this.settings["num_quest"]){
			$(".question_wrapper").show();
			$(".button_wrapper").hide();
			$(".feedback_wrapper").hide();
			$this.setData();
		}else{
			game.nextSlide();
		}
	});
};