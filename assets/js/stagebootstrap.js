var StageBootstrap = function(){
	
}

StageBootstrap.prototype.init = function(current_settings) {
	var $this = this
	$this.current_settings = current_settings;
	$this.gamedata = game.scorm_helper.getSingleData('game_data');
	$this.total_soal = 0;
	$this.total_step = 0;
	/*$this.gamedata = [];
	$this.gamedata["complete_stage"] = [1,3];
	$this.gamedata["failed_stage"] = [2];*/
	$this.stage = $(".stage").first().clone();
	$(".stage_wrapper").html("");
	$.get("config/setting_stage_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.background = e["background"];
		$this.itemsrow = e["items_row"];
		$this.items = e["items"];
		$this.button = e["button"];

		//count step
		$this.step_data = e["items"];
		$this.total_step = $this.step_data.length;
        game.total_step = $this.total_step;
        $this.tutorial_data = e["list_tutorial"];


		$this.get_total_soal();
	},"json");
};

  /*Function get total soal from all stage*/
StageBootstrap.prototype.get_total_soal = function() {
    var $this = this;
    $this.total_soal = game.total_soal;

    if($this.total_soal == 0){
        for (var i = 0; i < $this.total_step; i++) {
          let no = $this.current_settings["slide"] + (i+1);
          const no_2 = i;
          $.get("config/setting_quiz_slide_"+no+".json",function(e3){
              // e3 = (game.scorm_helper.lmsConnected == true ? JSON.parse(e3) : e3);
              $this.total_soal += e3["list_question"].length;
              game.total_soal = $this.total_soal;

              if(($this.total_step-1) == no_2){
                   	$this.setData();
              }
          },'json');
        }
    }else{
        $this.setData();
        // game.startTimerGlobal();
		// game.setProgresBar();
    }
};

StageBootstrap.prototype.setData = function() {
	var $this = this;
	var $col = 12/$this.itemsrow;
	var $mod = $this.items.length%2;
	$(".header").show();
	if($this.gamedata == undefined){
		$this.curr_step = 0;
		$this.life = game.life_max;
	}else{
		$this.curr_step = $this.gamedata["curr_step"] != undefined ? $this.gamedata["curr_step"] : 0;
		$this.life = ($this.gamedata["last_life"] != undefined ? $this.gamedata["last_life"] : game.life_max);
	}

	/*if(game.mode_life == true){
		$this.setLife();
	}*/

	/*Function set timer global*/
	if(game.time_global == true){
		if(game.start_timer_global == 0){
			game.startTimerGlobal();
		}
	}else{
	  $(".timer").hide();
	}
	/*End function set timer global*/

	$(".slider-content").css($this.background);
	$(".button_wrapper").find(".button_finish").html($this.button["text"]);
	$(".button_wrapper").find(".button_finish").css($this.button["css"]);
	$(".button_finish").click(function(e){
		$(this).off();
		game.scorm_helper.setSlide($this.button["gotoslide"]-1);
		game.nextSlide();
	});
	for(var i = 0; i < $this.items.length; i++){
		var $clone = $this.stage.clone();
		$($clone).attr("index",i+1);
		$($clone).attr("name",$this.items[i]);
		$($clone).addClass("col-xs-"+$col);
		if(i == $this.items.length-1 && $mod != 0 && $this.itemsrow > 1){
			$($clone).addClass("centered");
		}
		$($clone).find(".img_stage").attr("src","assets/image/game_map_stage/"+$this.items[i]["default"]);
		if($this.curr_step+1 == $($clone).attr("index")){
			$($clone).addClass("active");
		}
		if($this.gamedata != undefined){
			if($this.gamedata["complete_stage"] != undefined && $this.gamedata["failed_stage"] != undefined){
				var complete = $this.gamedata["complete_stage"];
				var failed = $this.gamedata["failed_stage"];
				for(var j = 0; j < complete.length; j++){
					if(complete[j] == $($clone).attr("index")){
						$($clone).addClass("complete");
					}
				}
				for(var j = 0; j < failed.length; j++){
					if(failed[j] == $($clone).attr("index")){
						$($clone).addClass("failed");
					}
				}
				if((complete.length+failed.length) == $this.items.length){
					$(".button_wrapper").show();
				}else{
					$(".button_wrapper").hide();
				}
			}
		}
		if($($clone).hasClass("complete")){
			$($clone).find(".img_stage").attr("src","assets/image/game_map_stage/"+$this.items[i]["complete"]);
		}else if($($clone).hasClass("failed")){
			$($clone).find(".img_stage").attr("src","assets/image/game_map_stage/"+$this.items[i]["failed"]);
		}else if($($clone).hasClass("active")){
			$($clone).click(function(e){
				$(this).off();
				let index = $(this).attr("index");
				if($this.game_data == undefined || $this.game_data["slide"] != undefined){
					let a = $this.current_settings["slide"] + parseInt(index);
					if($this.gamedata == undefined){
						$this.gamedata = {};
						$this.gamedata["curr_step"] = parseInt(index);
						game.scorm_helper.setSingleData("game_data",$this.gamedata);
					}else{
						$this.gamedata["curr_step"] = parseInt(index);
						game.scorm_helper.setSingleData("game_data",$this.gamedata);
					}
					game.setSlide(a);
				}else{
				  game.nextSlide();
				}
			});
		}else{
			$($clone).addClass("lock");
			$($clone).append("<img class='padlock' src='assets/image/game_map_stage/gembok.png'>");
		}
		$(".stage_wrapper").append($clone);
	}
};

StageBootstrap.prototype.setLife = function() {
	var $this = this;
    var count_star = 0;

    $(".header .star-wrapper").show();
    $(".star-wrapper .star").removeClass('active');
    var time_star = setInterval(function() {
        count_star++;
        if(count_star <= game.life_max){
            if(count_star<=$this.life){
                $(".star-wrapper .star:nth-child("+count_star+")").addClass("active");  
            }
            $(".star-wrapper .star:nth-child("+count_star+")").fadeIn(1000);
            $(".star-wrapper .star:nth-child("+count_star+")").css({"display":"inline-block"});            
        }
        else{
            clearInterval(time_star);
        }
    },200);
};