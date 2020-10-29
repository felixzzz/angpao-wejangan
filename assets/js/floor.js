var Floor = function(){
	
}

Floor.prototype.init = function(current_settings) {
	var $this = this;
	$this.current_settings = current_settings;
	$this.floornow = 0;
	$this.game_data = game.scorm_helper.getSingleData("game_data")?game.scorm_helper.getSingleData("game_data"):{};
	$this.curr_step = $this.game_data["curr_step"]?$this.game_data["curr_step"]:1;
	if($this.game_data["slide"] == undefined){
		$this.right = 0;
	}else{
		$this.right = $this.game_data["right"]?$this.game_data["right"]:0;
	}
	$this.floorwrapper = $(".eachfloor_wrapper").first().clone();
	$this.choice = $("#popupSoalFloor .choice").first().clone();
	$this.indicator = $(".indicator").first().clone();
	$.get("config/setting_floor_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.background = e["background"];
		$this.list_indi = e["indicator"];
		$this.list_soal = e["list_soal"];
		$this.floor = e["floor"];
		$this.slide_back = e["slide_back"];
		$this.setTutorial();
		$this.checkData();
	},"json");
};

Floor.prototype.setTutorial = function() {
	var $this = this;
	$("#tutorial .tutorial.floor").addClass("done");
  	$("#tutorial .tutorial.floor").addClass("active");
  	$("#tutorial").modal({backdrop: 'static',keyboard: true,show: true});
  	if(!$("#tutorial .tutorial.floor").find("div").first().hasClass("slick-initialized")){
  		$("#tutorial .tutorial.floor").find("div").first().slick({
	      	dots: true,
	      	infinite: false,
	      	speed: 500,
	      	prevArrow: false,
	      	nextArrow: false
	  	});
  	}
  	$("#tutorial .tutorial.floor").find("div").first().slick("slickGoTo",0);
  	$("#tutorial .tutorial.floor").find(".start-game").click(function(e){
    	$("#tutorial").modal('hide');
  	});
};

Floor.prototype.getQuestion = function() {
	var $this = this;
	var arr_quest = [];
	var arr_rand = [];
	var returnQuest = [];

	for (var i = 0; i < $this.list_soal.length; i++) {
		arr_quest.push(i);
	}

	if($this.isRandom == true){
		do{
			var rand = Math.ceil(Math.random()*(arr_quest.length-1));
			arr_rand.push(arr_quest[rand]);
			arr_quest.splice(rand,1);
		}while(arr_quest.length>0);

		returnQuest = arr_rand;
	}
	else{
		returnQuest = arr_quest;
	}

	return returnQuest;
};

Floor.prototype.checkData = function() {
	var $this = this;
	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
	if(ldata == undefined || ldata["answer"]== undefined || ldata["answer"]== null || ldata["answer"].length < $this.list_soal.length){
		var sdata = game.scorm_helper.setQuizData("game_slide_"+$this.current_settings["slide"],$this.getQuestion(),ldata);
		$this.list_question = sdata["list_question"];
		$this.answer = sdata["answer"];
		$this.curr_soal = sdata["answer"].length;
		$this.game_data["slide"] = true;
		game.audio.audioBackground.loop = true;
		game.audio.audioBackground.play();
		$this.setGame();
	}else{
		game.audio.audioBackground.pause();
		game.nextSlide();
	}
};

Floor.prototype.setGame = function() {
	var $this = this;
	var count = $this.floor.length-1;
	if($(window).outerWidth()*2 < $(window).outerHeight()){
		$(".game_wrapper").css("background","url(assets/image/floor/"+$this.background[1]+") no-repeat center / cover");
	}else{
		$(".game_wrapper").css("background","url(assets/image/floor/"+$this.background[0]+") no-repeat center / cover");
	}
	$(".floor_wrapper").html("");
	for(var i = 0; i < $this.floor.length; i++){
		var $clone = $this.floorwrapper.clone();
		$clone.attr("index",count);
		$clone.css("background","url(assets/image/floor/"+$this.floor[i]["background"]+") no-repeat center / cover");
		if($(window).outerWidth()*2 < $(window).outerHeight()){
			$clone.css("max-height","175px");
		}else{
			$clone.css("max-height","");
		}
		if($this.floor[i]["image"]){
			$clone.find(".image_wrapper").find("img").attr("src","assets/image/floor/"+$this.floor[i]["image"]);
		}else{
			$clone.find(".image_wrapper").remove();
		}
		$(".floor_wrapper").append($clone);
		count--;
	}
	$this.startGame();
};

Floor.prototype.startGame = function() {
	var $this = this;
	if($this.curr_soal < $this.list_soal.length){
		$this.setPeople();
		$this.setText();
		$this.setIndicator();
	}else{
		game.audio.audioBackground.pause();
		$this.setStage();
	}
};

Floor.prototype.setStage = function() {
	var $this = this;
	$this.game_data["complete_stage"] = $this.game_data["complete_stage"]?$this.game_data["complete_stage"]:[];
	$this.game_data["failed_stage"]  = $this.game_data["failed_stage"]?$this.game_data["failed_stage"]:[];
	if($this.right == $this.list_soal.length){
		$this.game_data["complete_stage"].push($this.curr_step);
	}else{
		$this.game_data["failed_stage"].push($this.curr_step);
	}
	//$this.curr_step++;
	$this.game_data["right"] = 0;
	$this.game_data["slide"] = undefined;
	$this.game_data["curr_step"] = $this.curr_step;
	game.scorm_helper.setSingleData("game_data",$this.game_data);
	game.setSlide($this.slide_back);
};

Floor.prototype.setPeople = function() {
	var $this = this;
	var $current_soal = $this.list_soal[$this.list_question[$this.curr_soal]];
	$(".eachfloor_wrapper[index='"+$current_soal["floor"]+"'] .people_wrapper").each(function(index){
		for(var i = 0; i < $current_soal["list_orang"].length; i++){
			if($(this).attr("index") == $current_soal["list_orang"][i]["position"]){
				$(this).find("img").attr("src","assets/image/floor/"+$current_soal["list_orang"][i]["image"]);
				$(this).addClass("active");
			}
		}
	});
};

Floor.prototype.setText = function(i = 0) {
	var $this = this;
	var $current_soal = $this.list_soal[$this.list_question[$this.curr_soal]];
	$(".eachfloor_wrapper[index='"+$current_soal["floor"]+"'] .text_character").hide();
	if(i < $current_soal["text"].length){
		$(".eachfloor_wrapper[index='"+$current_soal["floor"]+"'] .text_character[index='"+$current_soal["text"][i]["position"]+"']").find("p").html($current_soal["text"][i]["text"]);
		$(".eachfloor_wrapper[index='"+$current_soal["floor"]+"'] .text_character[index='"+$current_soal["text"][i]["position"]+"']").show();
		$(".eachfloor_wrapper").click(function(e){
			$(".eachfloor_wrapper").off();
			i++;
			$this.setText(i);
		});
	}else{
		$this.setSoal();
	}
};

Floor.prototype.setIndicator = function() {
	var $this = this;
	$(".indicator_wrapper").html("");
	for(var i = 0; i < $this.list_soal.length; i++){
		var $clone = $this.indicator.clone();
		if(i < $this.right){
			$clone.addClass("active");
			$clone.attr("src","assets/image/floor/"+$this.list_indi["active"]);
		}else{
			$clone.addClass("default");
			$clone.attr("src","assets/image/floor/"+$this.list_indi["default"]);	
		}
		$(".indicator_wrapper").append($clone);
	}
};

Floor.prototype.setSoal = function() {
	var $this = this;
	if($this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["image"]){
		$("#popupSoalFloor .img_quiz").attr("src","assets/image/floor/"+$this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["image"]);
	}else{
		$("#popupSoalFloor .img_quiz").hide();
	}
	if($this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["sub_question"]){
		$("#popupSoalFloor .sub_tittle").html($this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["sub_question"]);
	}else{
		$("#popupSoalFloor .sub_tittle").hide();
	}
	$("#popupSoalFloor .text").html($this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["question"]);
	var arr_temp = [];
	var arr_rand = [];
	for (var i = 0; i < $this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["pilihan"].length; i++) {
		arr_temp.push(i);
	}
	for (var i = 0; i < $this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["pilihan"].length; i++) {
		var rand = Math.floor((Math.random() * (arr_temp.length-1)));
		arr_rand.push(arr_temp[rand]);
		arr_temp.splice(rand, 1);
	}
	$("#popupSoalFloor .choices_wrapper").html("");
	for(var i = 0; i < arr_rand.length; i++){
		var $choice = $this.choice.clone();
		$choice.addClass($this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["type"]);
		$choice.attr("index",$this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["pilihan"][arr_rand[i]]["index"]);
		$choice.html($this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["pilihan"][arr_rand[i]]["text"]);
		$("#popupSoalFloor .choices_wrapper").append($choice);
	}
	$("#popupSoalFloor").modal({backdrop: 'static',keyboard: true,show: true});
	$this.settingClick();
};

Floor.prototype.settingClick = function() {
	var $this = this;
	var $current_soal = $this.list_soal[$this.list_question[$this.curr_soal]];
	if($current_soal["soal"]["type"] == "mc" || $current_soal["soal"]["type"] == "tf"){
		$(".button_wrapper").hide();
		$(".choice").click(function(){
			$(".choice").off();
			if(!$(this).hasClass("active")){
				$(this).addClass("active");
			}else{
				$(this).removeClass("active");
			}
			$this.cekJawaban();
		});
	}else if($current_soal["soal"]["type"] == "mmc"){
		$(".button_wrapper").hide();
		$(".choice").click(function(){
			if(!$(this).hasClass("active")){
				$(this).addClass("active");	
			}else{
				$(this).removeClass("active");
			}
		});
		$(".button_wrapper .btn_submit").click(function(e){
			$(this).off();
			$this.cekJawaban();
		});	
	}
};

Floor.prototype.cekJawaban = function() {
	var $this = this;
	var $current_soal = $this.list_soal[$this.list_question[$this.curr_soal]];
	$this.$flag = 1;
	$("#modal_feedback .modal_feedback").removeClass("benar");
	$("#modal_feedback .modal_feedback").removeClass("salah");
	$("#popupSoalFloor").modal("hide");
	$(".choice").each(function(index){
		if($(this).hasClass("active")){
			var $cek=0;
			for (var i = 0; i < $current_soal["soal"]["jawaban"].length; i++) {
				if($current_soal["soal"]["jawaban"][i] == $(this).attr("index")){
					$cek=1;
					break;
				}
			}
			if($cek == 0){
				$this.$flag=1;
				$(this).addClass("wrong");
			}
			else{
				$this.$flag=0;
				$(this).addClass("right");
			}
		}
	});
	if($this.$flag == 0){
		var $feedback = $this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["feedback"]["right"];
		$this.right++;
		$this.game_data["right"] = $this.right;
		game.scorm_helper.pushAnswer(1,$current_soal["soal"]["text"]);
		if($current_soal["soal"]["feedback_benar"]){
			$("#modal_feedback .modal_feedback").addClass("benar");
			$("#modal_feedback .modal_feedback p").html($current_soal["soal"]["feedback_benar"]);
		}
	}else{
		var $feedback = $this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["feedback"]["wrong"];
		game.scorm_helper.pushAnswer(0,$current_soal["soal"]["text"]);
		if($current_soal["soal"]["feedback_salah"]){
			$("#modal_feedback .modal_feedback").addClass("salah");
			$("#modal_feedback .modal_feedback p").html($current_soal["soal"]["feedback_salah"]);
		}
	}
	game.scorm_helper.setSingleData("game_data",$this.game_data);
	$this.showFeedback(0,$current_soal["floor"],$feedback);
};

Floor.prototype.showFeedback = function(index = 0, floor, feedback) {
	var $this = this;
	var $current_feedback = feedback;
	var $floor = floor;
	if($current_feedback[index]["to"] == 0){
		var left = 0;
	}else if($current_feedback[index]["to"] == 1){
		var left = 20;
	}else if($current_feedback[index]["to"] == 2){
		var left = 80;
	}else if($current_feedback[index]["to"] == 3){
		var left = 60;
	}
	if($current_feedback[index]["floor"] == $floor){
		$(".eachfloor_wrapper[index='"+$floor+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").animate({"left":left+"%"},{duration:1000,easing:"linear",start:function(){
			if($current_feedback[index]["walk"]){
				$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["walk"]);
			}
		},complete:function(){
			$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["image"]);
			$this.setTextFeedback(0,index,$floor,$current_feedback);
		}});
		if($current_feedback[index]["progress"]){
			$this.setProgress(index, $current_feedback);
		}
	}else if($current_feedback[index]["floor"] != -1){
		if($floor == -1){
			$floor = 0;
		}
		/*$(".eachfloor_wrapper[index='"+$floor+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").animate({"left":"40%"},{duration:1000,easing:"linear",start:function(){
			if($current_feedback[index]["walk_up"]){
				$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["walk_up"]);
			}
		},complete:function(){
			$(this).hide("scale",1000,function(){
				$(".eachfloor_wrapper[index='"+$floor+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").removeClass("active");
				$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").hide("scale",0,function(){
					$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").animate({"left":"40%"},{duration:1000,easing:"linear",start:function(){
					},complete:function(){
						if($current_feedback[index]["walk_down"]){
							$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["walk_down"]);
						}
						$(this).addClass("active");
						$(this).show("scale",1000,function(){
							$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").animate({"left":left+"%"},{duration:1000,easing:"linear",start:function(){
								if($current_feedback[index]["walk_down"]){
									$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["walk_down"]);
								}
							},complete:function(){
								$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["image"]);
								$this.setTextFeedback(0,index,$floor,$current_feedback);
								if($current_feedback[index]["progress"]){
									$this.setProgress(index, $current_feedback);
								}
							}});
						});
					}});
				});
			});
		}});*/
		$(".eachfloor_wrapper[index='"+$floor+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").animate({"left":"40%"},{duration:1000,easing:"linear",start:function(){
			if($current_feedback[index]["walk_up"]){
				$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["walk_up"]);
			}
		},complete:function(){
			$(".eachfloor_wrapper[index='"+$floor+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").removeClass("active");
			$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").animate({"left":"40%"},{duration:1000,easing:"linear",start:function(){
			},complete:function(){
				if($current_feedback[index]["walk_down"]){
					$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["walk_down"]);
				}
				$(this).addClass("active");
				$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").animate({"left":left+"%"},{duration:1000,easing:"linear",start:function(){
					if($current_feedback[index]["walk_down"]){
						$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["walk_down"]);
					}
				},complete:function(){
					$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["image"]);
					$this.setTextFeedback(0,index,$floor,$current_feedback);
					if($current_feedback[index]["progress"]){
						$this.setProgress(index, $current_feedback);
					}
				}});
			}});
		}});
	}else{
		/*$(".eachfloor_wrapper[index='"+$floor+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").animate({"left":"40%"},{duration:1000,easing:"linear",start:function(){
			$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["walk"]);
		},complete:function(){
			$(this).hide("scale",1000,function(){
				$(".eachfloor_wrapper[index='"+$floor+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").removeClass("active");
				$this.setTextFeedback(0,index,$floor,$current_feedback);
				if($current_feedback[index]["progress"]){
					$this.setProgress(index, $current_feedback);
				}
			});
		}});*/
		$(".eachfloor_wrapper[index='"+$floor+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").animate({"left":"40%"},{duration:1000,easing:"linear",start:function(){
			$(this).find("img").attr("src","assets/image/floor/"+$current_feedback[index]["walk"]);
		},complete:function(){
			$(".eachfloor_wrapper[index='"+$floor+"'] .people_wrapper[index='"+$current_feedback[index]["people"]+"']").removeClass("active");
			$this.setTextFeedback(0,index,$floor,$current_feedback);
			if($current_feedback[index]["progress"]){
				$this.setProgress(index, $current_feedback);
			}
		}});
	}
};

Floor.prototype.setProgress = function(index, $current_feedback) {
	var $this = this;
	/*$("#popupProgressFloor img").attr("src","assets/image/floor/"+$current_feedback[index]["progress"]["image"]);
	$("#popupProgressFloor .sub_tittle").html($current_feedback[index]["progress"]["title"]);*/
	$("#popupProgressFloor .text").html($current_feedback[index]["progress"]["text"]);
	$("#popupProgressFloor .progress-bar").removeClass("benar");
	$("#popupProgressFloor .progress-bar").removeClass("salah");
	$("#popupProgressFloor .progress_text").removeClass("benar");
	$("#popupProgressFloor .progress_text").removeClass("salah");
	$("#popupProgressFloor .progress-bar").css("width","0");
	$("#popupProgressFloor").modal({backdrop: 'static',keyboard: true,show: true});
	$("#popupProgressFloor .progress-bar").animate({"width":"100%"},{duration:5000,easing:"linear",step:function(now,fx){
		$("#popupProgressFloor .progress_text").html(Math.round(now)+"%");
	},complete:function(){
		if($this.$flag == 0){
			$("#popupProgressFloor .progress-bar").addClass("benar");
			$("#popupProgressFloor .progress_text").addClass("benar");
			$("#popupProgressFloor .progress_text").html("SUCCESS");
			$("#popupProgressFloor .text").html($current_feedback[index]["progress"]["right"]);
		}else{
			$("#popupProgressFloor .progress-bar").addClass("salah");
			$("#popupProgressFloor .progress_text").addClass("salah");
			$("#popupProgressFloor .progress_text").html("FAILED");
			$("#popupProgressFloor .text").html($current_feedback[index]["progress"]["wrong"]);
		}
		setTimeout(function(){
			$("#popupProgressFloor").modal("hide");
		},1000);
	}});
};

Floor.prototype.continueFeedback = function(index, floor , feedback) {
	var $this = this;
	var $current_feedback = feedback;
	var $floor = floor;
	if(index < $current_feedback.length-1){
		$(".floor_wrapper").click(function(){
			$(this).off();
			$floor = $current_feedback[index]["floor"];
			index++;
			$this.showFeedback(index,$floor,$current_feedback);
		});
	}else{
		if($this.$flag == 0){
			if($current_feedback[index]["popup"] != undefined){
				$("#popupItem").find("img").attr("src","assets/image/floor/"+$current_feedback[index]["popup"]["right"]);
				$("#popupItem").modal({backdrop: 'static',keyboard: true,show: true});
				setTimeout(function(e){
					$("#popupItem").modal("hide");
					$(".indicator.default").first().attr("src","assets/image/floor/"+$this.list_indi["active"]);
					$(".indicator.default").first().addClass("active");
					$(".indicator.default").first().removeClass("default");
					if($this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["feedback_benar"]){
						$("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
						$("#modal_feedback .btn_close").click(function(){
							$(this).off();
							$("#modal_feedback").modal("hide");
							$this.curr_soal++;
							$this.setGame();
						});
					}else{
						$this.curr_soal++;
						$this.setGame();
					}
				},1500);
			}else{
				if($this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["feedback_benar"]){
					$("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
					$("#modal_feedback .btn_close").click(function(){
						$(this).off();
						$("#modal_feedback").modal("hide");
						$this.curr_soal++;
						$this.setGame();
					});
				}else{
					$this.curr_soal++;
					$this.setGame();
				}
			}
		}else{
			if($current_feedback[index]["popup"] != undefined){
				$("#popupItem").find("img").attr("src","assets/image/floor/"+$current_feedback[index]["popup"]["wrong"]);
				$("#popupItem").modal({backdrop: 'static',keyboard: true,show: true});
				setTimeout(function(e){
					$("#popupItem").modal("hide");
					if($this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["feedback_salah"]){
						$("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
						$("#modal_feedback .btn_close").click(function(){
							$(this).off();
							$("#modal_feedback").modal("hide");
							$this.curr_soal++;
							$this.setGame();
						});
					}else{
						$this.curr_soal++;
						$this.setGame();
					}
				},1500);
			}else{
				if($this.list_soal[$this.list_question[$this.curr_soal]]["soal"]["feedback_salah"]){
					$("#modal_feedback").modal({backdrop: 'static',keyboard: true,show: true});
					$("#modal_feedback .btn_close").click(function(){
						$(this).off();
						$("#modal_feedback").modal("hide");
						$this.curr_soal++;
						$this.setGame();
					});
				}else{
					$this.curr_soal++;
					$this.setGame();
				}
			}
		}
	}
};

Floor.prototype.setTextFeedback = function(i = 0, index, floor , feedback) {
	var $this = this;
	var $current_feedback = feedback;
	var $floor = floor;
	$(".eachfloor_wrapper .text_character").removeClass("image");
	$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .text_character").hide();
	if($current_feedback[index]["text"]){
		if(i < $current_feedback[index]["text"].length){
			$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .text_character[index='"+$current_feedback[index]["text"][i]["position"]+"']").html("");
			if($current_feedback[index]["text"][i]["text"]){
				$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .text_character[index='"+$current_feedback[index]["text"][i]["position"]+"']").append("<p></p>");
				$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .text_character[index='"+$current_feedback[index]["text"][i]["position"]+"']").find("p").html($current_feedback[index]["text"][i]["text"]);
			}else{
				$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .text_character[index='"+$current_feedback[index]["text"][i]["position"]+"']").addClass("image");
				$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .text_character[index='"+$current_feedback[index]["text"][i]["position"]+"']").append("<img src=''>");
				$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .text_character[index='"+$current_feedback[index]["text"][i]["position"]+"']").find("img").attr("src","assets/image/floor/"+$current_feedback[index]["text"][i]["image"]);
			}
			$(".eachfloor_wrapper[index='"+$current_feedback[index]["floor"]+"'] .text_character[index='"+$current_feedback[index]["text"][i]["position"]+"']").show();
			$(".eachfloor_wrapper").click(function(e){
				$(".eachfloor_wrapper").off();
				i++;
				$this.setTextFeedback(i,index,$floor,$current_feedback);
			});
		}else{
			$this.continueFeedback(index,$floor,$current_feedback);
		}
	}else{
		$this.continueFeedback(index,$floor,$current_feedback);
	}
};