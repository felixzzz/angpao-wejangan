var RiskDecision = function(){
}

RiskDecision.prototype.init = function(current_settings) {

	var $this= this;
	$this.current_settings = current_settings;
	$this.indexbintang2 = 0;
	$this.flag_akhir = 0;
	$this.game_data = game.scorm_helper.getSingleData("game_data")?game.scorm_helper.getSingleData("game_data"):{};
	$this.curr_step = $this.game_data["curr_step"]?$this.game_data["curr_step"]:1;
	//PENGAMBILAN DATA DARI JSON
	$.get("config/setting_riskdecision_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.background = e["background"];
		$this.data_pertanyaan = e["list_question"];
		$this.isRandom = e["isRandom"];
		$this.backslide = e["slide_back"];
		$this.setTutorial();
		$this.createData();
	},'json');
}

RiskDecision.prototype.setTutorial = function() {
	var $this = this;
	$("#tutorial .tutorial.category_walk").addClass("done");
  	$("#tutorial .tutorial.category_walk").addClass("active");
  	$("#tutorial").modal({backdrop: 'static',keyboard: true,show: true});
  	if(!$("#tutorial .tutorial.category_walk").find("div").first().hasClass("slick-initialized")){
  		$("#tutorial .tutorial.category_walk").find("div").first().slick({
	      	dots: true,
	      	infinite: false,
	      	speed: 500,
	      	prevArrow: false,
	      	nextArrow: false
	  	});
  	}
  	$("#tutorial .tutorial.category_walk").find("div").first().slick("slickGoTo",0);
  	$("#tutorial .tutorial.category_walk").find(".start-game").click(function(e){
    	$("#tutorial").modal('hide');
  	});
};

RiskDecision.prototype.createData = function(){

	var $this = this;

	var ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);

	if(ldata == undefined || ldata["answer"]== undefined || ldata["answer"]== null || ldata["answer"].length < $this.data_pertanyaan.length){
		var sdata = game.scorm_helper.setQuizData("game_slide_"+$this.current_settings["slide"],$this.getQuestion(),ldata);
		$this.list_question = sdata["list_question"];
		$this.list_answer = sdata["answer"];
		$this.answer = sdata["answer"];
		$this.curr_soal = sdata["answer"].length;
		if(!$(".star").length){
		    if($this.data_pertanyaan){
		    	for(x=0;x<$this.data_pertanyaan.length;x++){
		    		$(".star-wrapper").append('<img class="star" src="assets/image/RiskDecision/Icon_Happy_EMPTY.png"></img>');
		    	}
		    }
		    $(".star").each(function(index){
		    	$(this).attr("index",index);
		    	for(var i = index; i < $this.answer.length; i++){
		    		if($this.answer[i] == 1){
		    			$(this).attr("src","assets/image/RiskDecision/Icon_Happy_FILLED.png");
		    			break;
		    		}
		    	}
		    });
		    for(var i = 0; i < $this.answer.length; i++){
	    		if($this.answer[i] == 1){
	    			$this.indexbintang2++;
	    		}
	    	}
  		}
		$this.Awalan();
	}
	else{
		if($this.backslide){
			$this.setStage();
		}else{
			game.nextSlide();
		}
	}
}

RiskDecision.prototype.setStage = function() {
	var $this = this;
	console.log("sad");
	$this.game_data["complete_stage"] = $this.game_data["complete_stage"]?$this.game_data["complete_stage"]:[];
	$this.game_data["failed_stage"]  = $this.game_data["failed_stage"]?$this.game_data["failed_stage"]:[];
	if($this.indexbintang2 == $this.data_pertanyaan.length){
		$this.game_data["complete_stage"].push($this.curr_step);
	}else{
		$this.game_data["failed_stage"].push($this.curr_step);
	}
	//$this.curr_step++;
	$this.game_data["right"] = 0;
	$this.game_data["slide"] = undefined;
	$this.game_data["curr_step"] = $this.curr_step;
	game.scorm_helper.setSingleData("game_data",$this.game_data);
	game.setSlide($this.backslide);
};

RiskDecision.prototype.getQuestion = function() {
	var $this = this;
	var arr_quest = [];
	var arr_rand = [];
	var returnQuest = [];

	for (var i = 0; i < $this.data_pertanyaan.length; i++) {
		arr_quest.push(i);
	}
	if($this.isRandom == true ){
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
	
RiskDecision.prototype.Awalan = function() {
	$this = this;
	$(".kotakbesar").css({"background":$this.background});
	$(".kotakgambar[index='0'] img").attr("src","assets/image/RiskDecision/"+$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["pilihan"][0]["default"]);
	$(".kotakgambar[index='1'] img").attr("src","assets/image/RiskDecision/"+$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["pilihan"][1]["default"]);
	$(".kotakgambar[index='2'] img").attr("src","assets/image/RiskDecision/"+$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["pilihan"][2]["default"]);
	$(".gambarorang").attr("src",$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["person"]["idle"]);
	$(".gambarorang").css("left",'50%');
	$(".gambarorang").css("top",'27%');
	$(".gambarorang").css("opacity",'0%');
	$(".tiperisk").html($this.data_pertanyaan[$this.list_question[$this.curr_soal]]["risk"]);
	$(".isirisk").html($this.data_pertanyaan[$this.list_question[$this.curr_soal]]["risk_desc"]);
	setTimeout(function(){
		$(".thinking").css("width",'0px');
		$(".thinking").show();
		$(".gambarorang").animate({
			opacity:"100%",
		},{
			duration:100,
			complete:function(){
				$(".thinking").animate({
					width:"15%",
				},{
					duration:0,
					complete:function(){
						$(".kotakgambar").click(function(e){
							$(".kotakgambar").off();
							var index = $(this).attr("index");
							$(this).find("img").attr("src","assets/image/RiskDecision/"+$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["pilihan"][index]["click"]);
							$(".thinking").hide();
							$this.Animasi(index);
						});
					}
				});
			}
		});
		
	},100);
};

RiskDecision.prototype.Animasi = function(index){
	$this = this;
	// $(".gambarorang").css("top",'');
	// $(".gambarorang").css("right",'');
	$(".gambarorang").attr("src",$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["person"]["down"]);
	if(index == 0){
		$(".gambarorang").animate(
			{left: "17%"}, 
			{
				duration:2000,
				easing: "easeInSine",
				complete: function() {
					$(".gambarorang").animate({
						top :"59%",
					},{
						duration:3000,
						easing:"easeInSine",
						complete:function(){
							$(".gambarorang").attr("src",$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["person"]["idle"]);
							setTimeout(function(){
								$this.tanya_proses(index);
							},1000);
						}
					});
				}
			}
		);
	}
	else if(index == 1){
		$(".gambarorang").animate(
			{top: "59%"},
			{
				duration:3000,
				easing: "easeInSine",
				complete: function() {
					$(".gambarorang").attr("src",$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["person"]["idle"]);
					setTimeout(function(){
						$this.tanya_proses(index);
					},1000);
				}
			}
		);
	}
	else if(index == 2){
		$(".gambarorang").animate(
			{left: "84%"}, 
			{
				duration:2000,
				easing: "easeInSine",
				complete: function() {
					$(".gambarorang").animate({
						top :"59%"
					},{
						duration:3000,
						easing:"easeInSine",
						complete:function(){
							$(".gambarorang").attr("src",$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["person"]["idle"]);
							setTimeout(function(){
								$this.tanya_proses(index);
							},1000);
						}
					});
				}
			}
		);
	}
}

RiskDecision.prototype.tanya_proses = function(index){
	$this = this;
	if(index==0){
		$(".talking").css("left","-70%");
		$(".talking").attr("src","assets/image/RiskDecision/Bubble_TALK.png");
		$(".processing").attr("src","assets/image/RiskDecision/Bubble_LOADING.png");
		$(".processing").css("left","-67%");
		$(".talking").show();
		setTimeout(function(){
			$(".talking").hide();
			$(".processing").show();
			setTimeout(function(){
				$this.cekjawaban(index);
			},2000);
		},2000);
	}else if(index == 1){
		$(".talking").css("left","0");
		$(".talking").attr("src","assets/image/RiskDecision/Bubble_TALK.png");
		$(".processing").attr("src","assets/image/RiskDecision/Bubble_LOADING.png");
		$(".processing").css("left","0");
		$(".talking").show();
		setTimeout(function(){
			$(".talking").hide();
			$(".processing").show();
			setTimeout(function(){
				$this.cekjawaban(index);
			},2000);
		},2000);
	}else if(index== 2){
		$(".talking").css("left","70%");
		$(".talking").attr("src","assets/image/RiskDecision/Bubble_TALK.png");
		$(".processing").attr("src","assets/image/RiskDecision/Bubble_LOADING.png");
		$(".processing").css("left","67%");
		$(".talking").show();
		setTimeout(function(){
			$(".talking").hide();
			$(".processing").show();
			setTimeout(function(){
				$this.cekjawaban(index);
			},2000);
		},2000);
	}
}

RiskDecision.prototype.cekjawaban = function(index){
	$this = this;
	var jawaban = $this.data_pertanyaan[$this.list_question[$this.curr_soal]]["jawaban"];
	var feedback_benar = $this.data_pertanyaan[$this.list_question[$this.curr_soal]]["feedback_benar"];
	var feedback_salah = $this.data_pertanyaan[$this.list_question[$this.curr_soal]]["feedback_salah"];

	if(index == jawaban){
		$(".processing").attr("src","assets/image/RiskDecision/Bubble_TRUE.png");
		game.scorm_helper.pushAnswer(1,$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["question"]);
		// $("#feedbackRisk").find(".feedbackakhir").attr("src","asset/"+feedback_benar);
		// $("#feedbackRisk").modal({backdrop: 'static',keyboard: true,show: true});
		setTimeout(function(){
			// $("#feedbackRisk").modal('hide');
			$this.flag_akhir = 1;
			$(".talking").attr("src","assets/image/RiskDecision/Bubble_HAPPY.png");
			$(".talking").show();
			setTimeout(function(){
				$(".talking").hide();
				$(".processing").hide();
				$(".star[index='"+$this.indexbintang2+"']").attr("src","assets/image/RiskDecision/Icon_Happy_FILLED.png");
				$this.indexbintang2++;
				$this.FeedbackAkhir();
			},2000);
		},2000);
	}else{
		$(".processing").attr("src","assets/image/RiskDecision/Bubble_FALSE.png");
		game.scorm_helper.pushAnswer(0,$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["question"]);
		// $("#feedbackRisk").find(".feedbackakhir").attr("src","asset/"+feedback_salah);
		// $("#feedbackRisk").modal({backdrop: 'static',keyboard: true,show: true});
		setTimeout(function(){
			// $("#feedbackRisk").modal('hide');
			$this.flag_akhir = 0;
			$(".talking").attr("src","assets/image/RiskDecision/Bubble_ANGRY.png");
			$(".talking").show();
			setTimeout(function(){
			$(".talking").hide();
			$(".processing").hide();
			$this.FeedbackAkhir();
			},2000);
		},2000);
	}
}

RiskDecision.prototype.FeedbackAkhir = function() {
	$this =this;
	$(".gambarorang").animate(
		{top :"40%",opacity:"0%"},
		{
			duration : 2000,
			easing: "easeInSine",
			start:function(){
				$(".gambarorang").attr("src",$this.data_pertanyaan[$this.list_question[$this.curr_soal]]["person"]["up"]);
			},
			complete: function() {
				$this.curr_soal += 1;
				if($this.curr_soal == $this.data_pertanyaan.length){
					$("#timerawalrisk").modal({backdrop: 'static',keyboard: true, show: true});
					/*setTimeout(function(){
						$("#timerawalrisk").modal('hide');
						if($this.backslide){
							$this.setStage();
						}else{
							game.nextSlide();
						}
					},6000);*/
					$("#timerawalrisk").modal('hide');
					if($this.backslide){
						$this.setStage();
					}else{
						game.nextSlide();
					}
				}else{
					$(this).off();
					$this.Awalan();
				}
			}
		}
	);
};