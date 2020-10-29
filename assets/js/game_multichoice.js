var GameMultichoice = function () {
  var $this = this;
}

GameMultichoice.prototype.init = function (current_settings) {
  var $this = this;
  $this.indexBintang = 0;
  $this.indexBintang2 = 0;
  $this.current_settings = current_settings;
  $this.penampung_jawaban = $("#popupSoalMultichoice").find(".choice").first().clone();
  $this.card_choice = $("#popupSoalMultichoice").find(".img_card").first().clone();
  $this.feedback_place_slider = $(".places_slider").first().clone();
  $this.game_data = (game.scorm_helper.getSingleData("game_data") ? game.scorm_helper.getSingleData("game_data") : {});
  $this.curr_step = $this.game_data["curr_step"] ? $this.game_data["curr_step"] : 1;
  $this.arr_rand_card = []; //data card
  $this.flag_show_tutorial = 0;

  $.get("config/setting_quizmultichoice_slide_" + $this.current_settings["slide"] + ".json", function (e) {
    console.log(e);
    $this.background = e["background"];
    $this.backgroundModalAwalAkhir = e["backgroundModalAwalAkhir"];
    $this.mode = e["evaluasi"];
    $this.listQuestion = e["list_question"];
    $this.total_question = e["list_question"].length;
    $this.question_data = e["list_question"];
    $this.setting = e["setting"];
    $this.backslide = e["slide_back"];
    // $this.list_card = e["list_card"];
    $this.isRandom = (e["setting"]["random"] != undefined ? true : false);
    $this.life_mode = (e["setting"]["life_mode"] ? e["setting"]["life_mode"] : false);
    // console.log($this.game_data);
    if($this.game_data["timer"] != undefined){
      $this.duration = $this.game_data["timer"];
    }else{
      $this.duration = (e["setting"]["duration"] != "" ? e["setting"]["duration"] : false);
    }
    $this.card_duration = (e["setting"]["card_remember_timer"] != "" ? e["setting"]["card_remember_timer"] : false);
    $this.curr_card_index = 0;
    $this.arr_rand_card = [];
    $this.flag_submit = 0;
    $this.popup_data = e["popup"];

    //flag
    $this.flag_stop_timer_card = 0;
    $this.flag_click_information_button = 0;

    //set background
    $(".slider-content").css({
      "background": $this.background
    });

    if($this.flag_show_tutorial == 0){
      $this.flag_show_tutorial = 1;
      $this.setTutorialSlider();
    }else{
      //set life
      if($this.life_mode){
        $this.curr_life = ($this.game_data["curr_life"] != undefined ? $this.game_data["curr_life"] : game.life_max);
        // $this.curr_life = (game.game_data["curr_life"] != undefined ? game_data["curr_life"] : 2);
        $this.setLife();
      }

      if($this.duration){
        $this.startGameTimer();
      }

      $this.createData();
    }
  }, 'json');
};


GameMultichoice.prototype.createData = function () {
  var $this = this;
  var ldata = game.scorm_helper.getLastGame("game_slide_" + $this.current_settings["slide"]);

  if (ldata == undefined || ldata["answer"] == undefined || ldata["answer"] == null || ldata["answer"].length < $this.listQuestion.length) {
    var sdata = game.scorm_helper.setQuizData("game_slide_" + $this.current_settings["slide"], $this.getQuestion(), ldata);
    $this.list_question = sdata["list_question"];
    $this.list_answer = sdata["answer"];
    $this.curr_soal = sdata["answer"].length;

    $(".star-wrapper").hide();
    /*Start wrapper*/
    // if ($this.listQuestion) {
    //   $(".star-wrapper").html("");
    //   for (x = 0; x < $this.listQuestion.length; x++) {
    //     $(".star-wrapper").append('<img class="star" src="assets/image/gameMultichoice/icon_empty.png"></img>');
    //   }
    // }
    // $(".star").each(function (index) {
    //   $(this).attr("index", index);
    //   for (var i = index; i < $this.list_answer.length; i++) {
    //     if ($this.list_answer[i] == 1) {
    //       $(this).attr("src", "assets/image/RiskDecision/icon_active.png");
    //       break;
    //     }
    //   }
    // });
    /*End start wrapper*/

    for (var i = 0; i < $this.list_answer.length; i++) {
      if ($this.list_answer[i] == 1) {
        $this.indexbintang2++;
      }
    }
    // $this.setTutorialSlider();
    $this.setPage();
  } else {
    if ($this.backslide) {
      // $this.setTutorialSlider();
      $this.setStage();
    } else {

      game.nextSlide();
    }
  }
};

GameMultichoice.prototype.getQuestion = function () {
  var $this = this;
  var arr_quest = [];
  var arr_rand = [];
  var returnQuest = [];

  for (var i = 0; i < $this.listQuestion.length; i++) {
    arr_quest.push(i);
  }
  if ($this.isRandom == true) {
    do {
      var rand = Math.ceil(Math.random() * (arr_quest.length - 1));
      arr_rand.push(arr_quest[rand]);
      arr_quest.splice(rand, 1);
    } while (arr_quest.length > 0);

    returnQuest = arr_rand;
  } else {
    returnQuest = arr_quest;
  }

  return returnQuest;
};


GameMultichoice.prototype.setTutorial = function () {
  var $this = this;

  // $(".talk-bubble").hide();
  $("#button").hide()
  // get current soal
  var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];

  if ($this.curr_soal < $this.question_data.length) {
    $("#tutorial .tutorial").removeClass("active");
    if (!$("#tutorial .tutorial.category").hasClass("done")) {
      $("#tutorial .tutorial.ho").addClass("done");
      $("#tutorial .tutorial.ho").addClass("active");
      $("#tutorial").modal({
        backdrop: 'static',
        keyboard: true,
        show: true
      });
    }
    $("#tutorial .start-game").click(function (e) {
      $(this).off();
      game.audio.audioButton.play();
      $("#tutorial").modal('hide');
      $this.setPage();
    });
  }
};

GameMultichoice.prototype.setPage = function (flag_first_call = true) {
  var $this = this;
  // $(".slider-content").css({
  //   "background": $this.background
  // });
  // console.log("$this.duration: ",$this.duration);
  if($this.duration > 0){
    $("#popupSoalMultichoice .list_question").show();

    $this.createQuiz(flag_first_call);
  }
};

GameMultichoice.prototype.setStage = function () {
  var $this = this;
  $this.game_data["complete_stage"] = $this.game_data["complete_stage"] ? $this.game_data["complete_stage"] : [];
  $this.game_data["failed_stage"] = $this.game_data["failed_stage"] ? $this.game_data["failed_stage"] : [];
  if ($this.indexBintang2 == $this.listQuestion.length) {
    $this.game_data["complete_stage"].push($this.curr_step);
  } else {
    $this.game_data["failed_stage"].push($this.curr_step);
  }
  //$this.curr_step++;
  $this.game_data["right"] = 0;
  $this.game_data["slide"] = undefined;
  $this.game_data["curr_step"] = $this.curr_step;
  game.scorm_helper.setSingleData("game_data", $this.game_data);
  game.setSlide($this.backslide);
};

GameMultichoice.prototype.createQuiz = function (flag_first_call) {
  // alert("createQuiz");
  var $this = this;
  $this.type = $this.listQuestion[$this.list_question[$this.curr_soal]]["type"];

  $("#popupSoalMultichoice .choice").remove();
  $("#popupSoalMultichoice .img_card").remove();
  if ($this.listQuestion[$this.list_question[$this.curr_soal]]["question"]) {
    $("#popupSoalMultichoice .soal").html($this.listQuestion[$this.list_question[$this.curr_soal]]["question"]);
    if ($this.listQuestion[$this.list_question[$this.curr_soal]]["css"]) {
      $("#popupSoalMultichoice .soal").css($this.listQuestion[$this.list_question[$this.curr_soal]]["css"]);
    } else {
      $("#popupSoalMultichoice .soal").removeAttr("style");
    }
    $("#popupSoalMultichoice .choice").html($this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"]);
    if ($this.listQuestion[$this.list_question[$this.curr_soal]]["backgroundSoal"]) {
      $("#popupSoalMultichoice .modalSoal").css({
        "background": $this.listQuestion[$this.list_question[$this.curr_soal]]["backgroundSoal"],
        "background-size": "100% 100%"
      });
    }
  }

  if ($this.listQuestion[$this.list_question[$this.curr_soal]]["image"]) {
    $("#popupSoalMultichoice #image-soal").attr("src", "assets/image/gameMultichoice/" + $this.listQuestion[$this.list_question[$this.curr_soal]]["image"]);
  } else {
    $("#popupSoalMultichoice #image-soal").hide();
  }

  $("#popupSoalMultichoice").modal({
    backdrop: 'static',
    keyboard: true,
    show: true
  });
  if ($this.type == "mc") {
    $("#popupSoalMultichoice").find(".button_wrapper").hide();
    $("#popupSoalMultichoice").find(".btn_next_submit").hide();
    if ($this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"]) {
      for (i = 0; i < $this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"].length; i++) {
        var clone = $this.penampung_jawaban.clone();
        $(clone).html($this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"][i]["text"]);
        $(clone).attr("index", $this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"][i]["index"]);
        $("#popupSoalMultichoice .choices").append(clone);
      }
    }
    $("#popupSoalMultichoice").find(".choice").click(function (e) {
      $(this).off();
      if (!$(this).hasClass("active")) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }
      $this.checkJawaban();
      if ($this.mode == false) {
        setTimeout(function () {
          $("#popupSoalMultichoice").modal('hide');
        }, 200);
      } else {
        $("#popupSoalMultichoice").modal('hide');
      }
    });
  } else if ($this.type == "mmc") {
    $("#popupSoalMultichoice").find(".button_wrapper").show();
    $("#popupSoalMultichoice").find(".btn_next_submit").removeClass('hide');
    $("#popupSoalMultichoice").find(".btn_next_submit").show();
    if ($this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"]) {
      for (j = 0; j < $this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"].length; j++) {
        var clone = $this.penampung_jawaban.clone();
        $(clone).html($this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"][j]["text"]);
        $(clone).attr("index", $this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"][j]["index"]);
        $("#popupSoalMultichoice .choices").append(clone);
      }
    }
    $("#popupSoalMultichoice").find(".choice").click(function (e) {
      if (!$(this).hasClass("active")) {
        $(this).addClass("active");
      } else {
        $(this).removeClass("active");
      }

    })
    $("#popupSoalMultichoice").find(".btn_next_submit").click(function (e) {
      $(this).off();
      $("#popupSoalMultichoice").find(".btn_next_submit").hide();
      $this.checkJawaban();
      if ($this.mode == false) {
        setTimeout(function () {
          $("#popupSoalMultichoice").modal('hide');
        }, 200);
      } else {
        $("#popupSoalMultichoice").modal('hide');
      }
    })
  } else if ($this.type == "tf") {
    $("#popupSoalMultichoice").find(".button_wrapper").hide();
    $("#popupSoalMultichoice").find(".truefalse_wrapper").removeClass('hide');
    $("#popupSoalMultichoice").find(".truefalse_wrapper").show();
    var flagTrueFalseText = 1;
    if (flagTrueFalseText == 1) {
      var clone = $this.penampung_jawaban.clone();
      $("#popupSoalMultichoice").find(".btn_true").html($this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"][0]["text"]);
      $("#popupSoalMultichoice").find(".btn_false").html($this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"][1]["text"]);
    }
    $("#popupSoalMultichoice").find(".btn_true").click(function (e) {
      $(this).addClass("active");
      $(this).off();
      $("#popupSoalMultichoice").find(".btn_false").off();
      $this.checkJawaban();
      if ($this.mode == false) {
        setTimeout(function () {
          $("#popupSoalMultichoice").modal('hide');
        }, 200);
      } else {
        $("#popupSoalMultichoice").modal('hide');
      }
    });
    $("#popupSoalMultichoice").find(".btn_false").click(function (e) {
      $(this).addClass("active");
      $(this).off();
      $("#popupSoalMultichoice").find(".btn_true").off();
      $this.checkJawaban();
      if ($this.mode == false) {
        setTimeout(function () {
          $("#popupSoalMultichoice").modal('hide');
        }, 200);
      } else {
        $("#popupSoalMultichoice").modal('hide');
      }
    });
  } else if ($this.type == "mc_card_switch") {
      // alert("mc_card");
      //show image info
      $("#popupSoalMultichoice").find(".question_and_choice").addClass("mc_card_switch");
      $(".img_info").show();

      $("#popupSoalMultichoice").find(".button_wrapper").hide();
      $("#popupSoalMultichoice").find(".btn_next_submit").removeClass('hide');
      // $("#popupSoalMultichoice").find(".btn_next_submit").show();

      $this.clone_card_scanning = $("#popupSoalMultichoice .card_wrapper .img_card_scanning").first().clone();
      // $("#popupSoalMultichoice .img_card_scanning").remove();
      $("#popupSoalMultichoice").find(".card_wrapper").hide();


      // $("#popupSoalMultichoice").find("#image-soal").css("visibility","hidden");
      // $("#popupSoalMultichoice").find(".soal").css("visibility","hidden");
      $("#popupSoalMultichoice").find(".choices").css({
        "background": "url('assets/image/gameMultichoice/bg-kuis-fg-02.png')",
        "background-size": "100% 100%"
      });
      $("#popupSoalMultichoice").find(".timer_quiz").hide();

      let arr_card = [];
      let flag_random = 0;
      $this.flag_submit = 0;
      $this.list_card = $this.listQuestion[$this.list_question[$this.curr_soal]]["pilihan"];

      if($this.list_card.length == 5){
        $("#popupSoalMultichoice").find(".question_and_choice ").addClass("five_cards");
      }

      //check random first question
      // alert(flag_first_call);
      if($this.setting["card_random_first_question"] && flag_first_call == true){
        flag_random = 1;
        $("#popupSoalMultichoice").find("#image-soal").css("visibility","hidden");
        $("#popupSoalMultichoice").find(".soal").css("visibility","hidden");
      }else if(flag_first_call == true){
        flag_random = 1;
      }

      console.log(flag_random);
      for (var i = 0; i < $this.list_card.length; i++) {
        arr_card.push(i);
      }
      
      if(flag_random == 1){
        // if($this.arr_rand_card.length > 0){
        //   $this.arr_rand_card = [];
        // }

        do {
          var rand = Math.ceil(Math.random() * (arr_card.length - 1));
          $this.arr_rand_card.push(arr_card[rand]);
          arr_card.splice(rand, 1);
        } while (arr_card.length > 0);

      }else{
        if($this.arr_rand_card.length == 0){
          $this.arr_rand_card = arr_card;
        }
      }

      console.log($this.arr_rand_card);
      for (var i = 0; i < $this.list_card.length; i++) {
        let clone = $this.card_choice.clone();
        // let clone_2 = $this.clone_card_scanning.clone();
        // // console.log(clone);
        //  if($this.list_card.length == 5){
        //   if (i == 2) {
        //       $(clone).css("width","100%");
        //       $(clone).find(".flip-box-inner").css({"width":"50%","margin":"0 auto"});
        //   }
        // }

        $(clone).hide();

        // console.log($this.list_card[$this.arr_rand_card[i]]);
        $(clone).html($this.list_card[$this.arr_rand_card[i]]["text"]);
        // $(clone).find(".img_back").attr("src","assets/image/gameMultichoice/card_back.png");
        $(clone).attr("index", $this.list_card[$this.arr_rand_card[i]]["index"]);
        $(clone).attr("id", "img_card-"+$this.list_card[$this.arr_rand_card[i]]["index"]);
        // $(clone_2).attr("id", "img_card_scanning-"+$this.list_card[$this.arr_rand_card[i]]["index"]);
        // console.log(clone);
        $("#popupSoalMultichoice .choices .card_wrapper").append(clone);
        // $("#popupSoalMultichoice .choices .card_wrapper").append(clone_2);
      }

      let clone_timer = $("#popupSoalMultichoice .timer_quiz").clone();
      $("#popupSoalMultichoice .timer_quiz ").remove();
      $("#popupSoalMultichoice .choices .card_wrapper").append(clone_timer);

      // $this.setTimerCard();
      $("#popupSoalMultichoice .loading_wrapper").show();
      setTimeout(function(){
        $("#popupSoalMultichoice .choices .loading_wrapper").hide();
        $("#popupSoalMultichoice .choices .card_wrapper").css({"display":"table"});

        $this.curr_card_index += 1;
        console.log($this.curr_card_index);
        console.log($this.arr_rand_card);
        $("#popupSoalMultichoice .choices #img_card-"+$this.arr_rand_card[$this.curr_card_index]).show();
        $("#popupSoalMultichoice .button").hide();
        $("#popupSoalMultichoice .btn_wrapper").show();
        $this.flag_stop_timer_card = 0;
        $this.setTimerCard();

        $("#popupSoalMultichoice").find(".img-btn").unbind().click(function (e) {
            let src = "assets/audio/sound_button_quiz.wav";
            game.audio.audio_dynamic(src).play();

            if(!$(this).hasClass("disabled")){
              if($this.flag_click_information_button == 0){
                //hide modal soal
                $("#popupSoalMultichoice").modal("hide");

                //show modal alert
                $("#popupAlert").unbind().click(function(){
                  // console.log("popupAlert");
                  let src = "assets/audio/sound_button_quiz.wav";
                  game.audio.audio_dynamic(src).play();

                  $(this).modal("hide");

                  $("#popupSoalMultichoice").modal({
                    backdrop: 'static',
                    keyboard: true,
                    show: true
                  });
                });

                $("#popupAlert").modal({
                  backdrop: 'static',
                  keyboard: true,
                  show: true
                });
              }else{
                $(this).addClass("disabled");

                //scanning jawaban
                $this.flag_stop_timer_card = 1;
                clearInterval($this.timer_interval);
                clearInterval($this.timer_card);
                $("#popupSoalMultichoice .timer_quiz").hide();
                // let html = '<div class="img_card_scanning" index="0" style="" id=""></div>';
                // $("#popupSoalMultichoice .card_wrapper").append(html);
                // $("#popupSoalMultichoice .card_wrapper #img_card_scanning-"+$this.arr_rand_card[$this.curr_card_index]).addClass("active");            
                // $("#popupSoalMultichoice .card_wrapper .img_card_scanning").show();
                $("#popupSoalMultichoice .card_wrapper .img_card_scanning").addClass("active");            
                // $("#popupSoalMultichoice .card_wrapper #img_card-"+$this.arr_rand_card[$this.curr_card_index]).css("transform","scaleX(1)");
                $this.flag_submit = 1;         

                setTimeout(function(){
                    // $("#popupSoalMultichoice .card_wrapper #img_card_scanning-"+$this.arr_rand_card[$this.curr_card_index]).hide();
                    // $("#popupSoalMultichoice .card_wrapper #img_card_scanning-"+$this.arr_rand_card[$this.curr_card_index]).removeClass("active");
                    // $("#popupSoalMultichoice .card_wrapper .img_card_scanning").hide();
                    $("#popupSoalMultichoice .card_wrapper .img_card_scanning").removeClass("active");
                    // $("#popupSoalMultichoice .card_wrapper .img_card_scanning").remove(); 
                    $this.checkJawaban();
                },1000);
              }
            }
        });

        $("#popupSoalMultichoice").find(".img_info").unbind().click(function (e) {
            let src = "assets/audio/sound_button.wav";
            game.audio.audio_dynamic(src).play();

            $this.flag_click_information_button = 1;

            clearInterval($this.timer);
            clearInterval($this.timer_card);

            $this.showPopupList_2("#popupListFullScreen", $this.popup_data);
        });
      },1000);
  }
};

GameMultichoice.prototype.checkJawaban = function () {
  var $this = this;
  var $count = 0;

  $this.flagJawaban = 1;

  //get current soal
  var $current_soal = $this.listQuestion[$this.list_question[$this.curr_soal]];

  //cek jawaban MMC
  if ($this.type == "mmc") {
    $("#popupSoalMultichoice").find(".choice").each(function () {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        var $cek = 0;
        for (var i = 0; i < $current_soal["jawaban"].length; i++) {
          if ($current_soal["jawaban"][i] == $(this).attr("index")) {
            $cek = 1;
            break;
          }
        }
        if ($this.mode == false) {
          if ($cek == 1) {
            $count++;
            $(this).addClass("right");
          } else {
            $count = 0;
            $(this).addClass("wrong");
          }
        } else {
          if ($cek == 1) {
            $count++;
            //$(this).addClass("right");
          } else {
            $count = 0;
            // $(this).addClass("wrong");
          }
        }
      }
    })

    if ($count == $current_soal["jawaban"].length) {

      $this.flagJawaban = 0;
    } else {
      $this.flagJawaban = 1;
    }
  }

  //cek jawaban TF
  if ($this.type == "tf") {
    $("#popupSoalMultichoice .truefalse_wrapper").find(".button").each(function () {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        var $cek = 0;
        for (var i = 0; i < $current_soal["jawaban"].length; i++) {
          if ($current_soal["jawaban"][i] == $(this).attr("index")) {
            $cek = 1;
          }
        }
        if ($this.mode == false) {
          if ($cek == 1) {
            $(this).addClass("right");
          } else {
            $this.flagJawaban = 1;
            $(this).addClass("wrong");
          }
        } else {
          if ($cek == 1) {
            $this.flagJawaban = 0;
            //$(this).addClass("right");
          } else {
            $this.flagJawaban = 1;
            //$(this).addClass("wrong");
          }
        }
      }
    })
  }

  //cek jawaban MC
  if ($this.type == "mc") {
    $("#popupSoalMultichoice").find(".choice").each(function (index) {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        var $cek = 0;
        for (var i = 0; i < $current_soal["jawaban"].length; i++) {;
          if ($current_soal["jawaban"][i] == $(this).attr("index")) {
            $cek = 1;
            break;
          }
        }

        if ($this.mode == false) {
          if ($cek == 1) {
            $(this).addClass("right");
          } else {
            $this.flagJawaban = 1;
            $(this).addClass("wrong");
          }
        } else {
          if ($cek == 1) {
            $this.flagJawaban = 0;
            //$(this).addClass("right");
          } else {
            $this.flagJawaban = 1;
            //$(this).addClass("wrong");
          }
        }
      }
    })
  }

  //cek jawaban MC card
  if ($this.type == "mc_card") {
    $("#popupSoalMultichoice").find(".img_card").each(function (index) {
      if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        var $cek = 0;
        let arr_jawaban = $current_soal["jawaban"];
        for (var i = 0; i < $current_soal["jawaban"].length; i++) {
          if ($current_soal["jawaban"][i] == $(this).attr("index")) {
            $cek = 1;
            break;
          }
        }

        // alert($this.mode);
        // alert($cek);
        if ($this.mode == false) {
          if ($cek == 1) {
            $this.flagJawaban = 0;

            $("#popupSoalMultichoice").find(".img_card .flip-box-inner").css("transform","unset");
            // $(this).addClass("right");

            for (var i = 0; i < arr_jawaban.length; i++) {
              $("#popupSoalMultichoice").find(".img_card[ index=" + arr_jawaban[i] + "]").addClass("right");
            }
          } else {
            $this.flagJawaban = 1;
            $(this).addClass("wrong");

            //give key answer
            $("#popupSoalMultichoice").find(".img_card .flip-box-inner").css("transform","unset");
            for (var i = 0; i < arr_jawaban.length; i++) {
                $("#popupSoalMultichoice").find(".img_card[ index=" + arr_jawaban[i] + "]").addClass("right");
                // $("#popupSoalMultichoice").find(".img_card[ index=" + arr_jawaban[i] + "] .flip-box-inner").css("transform","unset");
            }
          }
        } else {
          if ($cek == 1) {
            $this.flagJawaban = 0;
            //$(this).addClass("right");
          } else {
            $this.flagJawaban = 1;
            //$(this).addClass("wrong");
          }
        }
      }
    })
  }

  //cek jawaban MC card switch
  if ($this.type == "mc_card_switch") {
    let index_jawaban = $this.arr_rand_card[$this.curr_card_index];

    if($current_soal["jawaban"] == index_jawaban){
      $this.flagJawaban = 0;
      $("#popupSoalMultichoice .card_wrapper #img_card-"+$this.arr_rand_card[$this.curr_card_index]).addClass("right");
      $("#popupSoalMultichoice .card_wrapper #img_card-"+$this.arr_rand_card[$this.curr_card_index]).html("CORRECT!");
    }else{
      $this.flagJawaban = 1;
      $("#popupSoalMultichoice .card_wrapper #img_card-"+$this.arr_rand_card[$this.curr_card_index]).addClass("wrong");
      $("#popupSoalMultichoice .card_wrapper #img_card-"+$this.arr_rand_card[$this.curr_card_index]).html("INCORRECT!");
    }
  }
  //end check jawaban

  //feedback
  // alert($this.flagJawaban);
  if ($this.flagJawaban == 0) {
    if ($this.mode == false && $this.type != "mc_card_switch") {
      game.audio.audioBenar.play();
      $(".alert").addClass("benar");
    }else if($this.type == "mc_card_switch"){
      game.audio.audioBenar.play();
    }

    $(".modal_feedback").addClass("benar");
    $(".star[index='" + $this.indexBintang2 + "']").attr("src", "assets/image/gameMultichoice/icon_active.png");
    $this.indexBintang2++;
    // $this.feedback();
    game.scorm_helper.pushAnswer(1, $this.listQuestion[$this.list_question[$this.curr_soal]]["question"]["text"]);
  } else if ($this.flagJawaban == 1) {
    if ($this.mode == false && $this.type != "mc_card_switch") {
      game.audio.audioSalah.play();
      $(".alert").addClass("salah");
    }else if($this.type == "mc_card_switch"){
      game.audio.audioSalah.play();
    }

    $(".modal_feedback").addClass("salah");

    if($this.setting["repeat_false_answer"] == true){
      let ldata = game.scorm_helper.getLastGame("game_slide_"+ $this.current_settings["slide"]);
      console.log(ldata);
      let question_arr = [].concat(ldata["list_question"]);
      console.log(question_arr);
      let curr_index = ldata["answer"].length;
      console.log("curr_index: ",curr_index)
      let selected_answer_value = ldata["list_question"][curr_index];
      question_arr.splice(curr_index,1);
      question_arr.push(selected_answer_value);
      console.log(question_arr);
      // console.log(answer_arr);
      game.scorm_helper.setListQuest(question_arr);
      game.startGame = 1;
      // let ldata2 = game.scorm_helper.setListQuest("game_slide_" + $this.current_settings["slide"], question_arr, ldata);

      let ldata2 = game.scorm_helper.getLastGame("game_slide_"+ $this.current_settings["slide"]);
      //set list question terupdate
      $this.list_question = ldata2["list_question"];
      console.log(ldata2);
    }else{
      // $this.feedback();
      game.scorm_helper.pushAnswer(0, $this.listQuestion[$this.list_question[$this.curr_soal]]["question"]["text"]);
    }
  }

  setTimeout(function () {
    $(".alert").removeClass("benar");
    $(".alert").removeClass("salah");

    $("#popupSoalMultichoice").find(".img_card").removeClass("clickable");
    $("#popupSoalMultichoice").find(".img_card").removeClass("right");
    $("#popupSoalMultichoice").find(".img_card").removeClass("wrong"); 

    if($this.type == "mc_card") {
      $("#popupSoalMultichoice").find(".img_card .flip-box-inner").css("transform","rotateY(180deg)");

      setTimeout(function () {
        let ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
        console.log(ldata);

        if(ldata["answer"].length == $this.setting["card_random_range_question"]){
          //show loading
          // alert("show loading");
          $("#popupSoalMultichoice").find(".card_wrapper").hide();
          $("#popupSoalMultichoice").find(".loading_wrapper").show();

          setTimeout(function(){
            $this.curr_soal += 1;
            let flag_first_call = true;

            $("#popupSoalMultichoice").find(".card_wrapper").show();
            $("#popupSoalMultichoice").find(".loading_wrapper").hide();
            $this.setPage(flag_first_call);
          },3000);
        }else if(ldata["answer"].length == ldata["list_question"].length){
          //show button next
          // alert("show button next");
          $("#popupSoalMultichoice").find(".card_wrapper").hide();
          $("#popupSoalMultichoice").find(".btn_wrapper").show();

          $("#popupSoalMultichoice").find(".btn_wrapper").click(function(){
              $("#popupSoalMultichoice").modal('hide');
              $(this).off();
              game.audio.audioButton.play();
              game.nextSlide();
          });
        }else{
          let flag_first_call = false;
          $this.curr_soal += 1;
          $this.setPage(flag_first_call);
        }
      }, 1000);
    }else if($this.type == "mc_card_switch"){
        let ldata = game.scorm_helper.getLastGame("game_slide_"+$this.current_settings["slide"]);
        console.log(ldata);

        $("#popupSoalMultichoice").find(".img-btn").removeClass("disabled");

        if(ldata["answer"].length == ldata["list_question"].length){
          $("#popupSoalMultichoice").modal('hide');

          clearInterval($this.timer_interval);
          clearInterval($this.timer_card);
          clearInterval($this.timer);
          $this.flag_stop_timer_card = 1;

          //set undefined game data
          $this.game_data = {};
          game.scorm_helper.setSingleData("game_data", $this.game_data);

          game.nextSlide();
        }else{
          if($this.life_mode == true){
            console.log("$this.curr_life: ",$this.curr_life);

            //jawaban salah
            if($this.flagJawaban == 1){
              if($this.curr_life == 1){
                $this.curr_life -= 1;
                $this.setLife();

                let ldata = game.scorm_helper.getLastGame("game_slide_"+ $this.current_settings["slide"]);
                console.log(ldata);
                let answer_data = ldata["answer"];

                for (var i = answer_data.length; i < $this.list_question.length; i++) {
                  answer_data.push(0);
                }

                game.scorm_helper.setAnswer(answer_data, $this.list_question);
                let ldata_2 = game.scorm_helper.getLastGame("game_slide_"+ $this.current_settings["slide"]);
                console.log(ldata_2);

                clearInterval($this.timer_interval);
                console.log("$this.timer_card: ",$this.timer_card);
                clearInterval($this.timer_card);
                console.log("$this.timer_card: ",$this.timer_card);
                clearInterval($this.timer);
                $this.flag_stop_timer_card = 1;

                $("#popupSoalMultichoice").modal('hide');

                //set undefined game data
                $this.game_data = {};
                game.scorm_helper.setSingleData("game_data", $this.game_data);

                game.nextSlide();
              }else{
                $this.curr_life -= 1;
                $this.setLife();

                if($this.setting["repeat_false_answer"] == true){
                  $this.setPage();
                }else{
                  // alert("curr_soal: ",$this.curr_soal);
                  $this.curr_soal += 1;
                  // alert("curr_soal: ",$this.curr_soal);
                  $this.setPage();
                }
              }
            }else{
                $this.curr_soal += 1;
                $this.setPage();
            }
          }else{
             // let flag_first_call = false;
            $this.curr_soal += 1;
            $this.setPage();
          }
        }

        let timer_quiz = $this.duration;
        let curr_life = $this.curr_life;
        $this.game_data["timer"] = timer_quiz;
        $this.game_data["curr_life"] = curr_life;
        game.scorm_helper.setSingleData("game_data", $this.game_data);
        console.log($this.game_data);
    }
  }, 2000);
};

GameMultichoice.prototype.feedback = function () {
  var $this = this;
  var isFeedback = false;
  var $current_soal = $this.question_data[$this.list_question[$this.curr_soal]];

  //set feedback
  if ($current_soal["feedback_benar"] && $current_soal["feedback_salah"]) {
    isFeedback = true;
    $("#modal_feedback .description .description_wrapper").html("");
    if ($this.flagJawaban == 0) {
      $("#modal_feedback .description .description_wrapper").html("");
      var $clone_sliderwrapper = $this.feedback_place_slider.clone();
      $clone_sliderwrapper.find("p").html($current_soal["feedback_benar"][0]);
      $("#modal_feedback .description .description_wrapper").append($clone_sliderwrapper);
    } else {
      $("#modal_feedback .description .description_wrapper").html("");
      var $clone_sliderwrapper = $this.feedback_place_slider.clone();
      $clone_sliderwrapper.find("p").html($current_soal["feedback_salah"][0]);
      $("#modal_feedback .description .description_wrapper").append($clone_sliderwrapper);
    }
  }

  //show feedback
  if (isFeedback == true) {
    $("#modal_feedback").modal({
      backdrop: 'static',
      keyboard: true,
      show: true
    });
    $("#modal_feedback .close_feedback").click(function (e) {
      $(this).off();
      $("#modal_feedback").modal('hide');
      if ($(".modal_feedback").hasClass("benar")) {
        $(".modal_feedback").removeClass("benar");
      } else {
        $(".modal_feedback").removeClass("salah");
      }
      $(".curr_soal").html($this.curr_soal);
      $this.curr_soal += 1;
      if ($this.curr_soal == $this.total_question) {
        $(".modal-backdrop.in").css("display", "none");
        if ($this.backslide) {
          $this.setStage();
        } else {
          game.nextSlide();
        }
      } else {
        $this.setPage();
      }
    });
  } else if (isFeedback == false) {
    setTimeout(function () {
      if ($(".modal_feedback").hasClass("benar")) {
        $(".modal_feedback").removeClass("benar");
      } else {
        $(".modal_feedback").removeClass("salah");
      }
      if ($this.flagJawaban == 0) {
        $("#popupItemCategory").find("img").attr("src", "assets/image/gameMultichoice/" + $current_soal["feedback_benar_image"]);
      } else {
        $("#popupItemCategory").find("img").attr("src", "assets/image/gameMultichoice/" + $current_soal["feedback_salah_image"]);
      }
      $("#popupItemCategory").modal({
        backdrop: 'static',
        keyboard: true,
        show: true
      });
      setTimeout(function () {
        $("#popupItemCategory").modal("hide");
        $this.curr_soal += 1;
        if ($this.curr_soal == $this.total_question) {
          if ($this.backslide) {
            $this.setStage();
          } else {
            game.nextSlide();
          }
        } else {
          $this.setPage();
        }
      }, 2000);
    }, 300);
  }
};

GameMultichoice.prototype.startTimerBar = function() {
    console.log('startTimerBar');
    // alert("startTimerBar");
    var $this = this;
    $(".timer_quiz").show();
   
    // console.log($this.isStartTime);
    $this.time = $this.setting["card_remember_timer"];
    if($this.time != undefined){
        $this.start_timer_global = 1;
        // console.log($this.countTime);
        $this.countTime = $this.time;
        $this.total_time = $this.time;
        $(".timer_quiz .progress-bar").css("width","100%");
        $this.timer_interval = setInterval(function() {
            // console.log('test');
            console.log($this.countTime);
            if($this.countTime>0){
                $this.countTime = $this.countTime-1;
                let percent =  $this.countTime / $this.total_time * 100;
                $(".timer_quiz .progress-bar").css("width",percent+"%");
            }else{
                clearInterval($this.timer_interval);

                $(".timer_quiz").hide();
                $("#popupSoalMultichoice").find("#image-soal").css("visibility","unset");
                $("#popupSoalMultichoice").find(".soal").css("visibility","unset");
                $("#popupSoalMultichoice .choices .flip-box-inner").css("transform","rotateY(180deg)");
                $("#popupSoalMultichoice .choices .flip-box").addClass("clickable");
                // $this.time = null;
                // game.setSlide(9);
            }
        },1000);
    }
} 

GameMultichoice.prototype.setTimerCard = function() {
    console.log('setTimerCard');
    // alert("startTimerBar");
    var $this = this;
    $(".timer_quiz").show();
   
    // console.log($this.isStartTime);
    $this.time = $this.card_duration;
    if($this.time != undefined){
        // $this.start_timer_global = 1;
        console.log("time: ",$this.time);
        $this.countTimerCard = $this.time;
        $this.total_time = $this.time;
        $(".timer_quiz .progress-bar").css("width","100%");
        $this.timer_card = setInterval(function() {
            // console.log('test');
            console.log($this.countTimerCard);
            if($this.countTimerCard>0){
                $this.countTimerCard = $this.countTimerCard-1;
                let percent =  $this.countTimerCard / $this.total_time * 100;
                console.log("percent: ",percent);
                $(".timer_quiz .progress-bar").css("width",percent+"%");
            }else{
                clearInterval($this.timer_card);
                
                if($this.flag_submit == 0){
                  if($this.curr_card_index < ($this.arr_rand_card.length-1)){
                    $this.curr_card_index += 1;
                  }else{
                    //reset curr card index if reach maximum arr rand card index
                    $this.curr_card_index = 0;
                  }

                  $("#popupSoalMultichoice .choices .img_card").hide();
                  // console.log("curr_card_index: ",$this.curr_card_index);
                  $("#popupSoalMultichoice .choices #img_card-"+$this.arr_rand_card[$this.curr_card_index]).show();

                  console.log("$this.flag_stop_timer_card: ",$this.flag_stop_timer_card);
                  if($this.flag_stop_timer_card == 0){
                    $this.setTimerCard();
                  }
                }else{

                }
            }
        },1000);
    }
}

GameMultichoice.prototype.setLife = function() {
    var $this = this;
    var count_star = 0;
    
    // $(".life-wrapper .life").removeClass('active');
    // var time_star = setInterval(function() {
    //     count_star++;
    //     if(count_star <= game.life_max){
    //         console.log($this.curr_life);
    //         if(count_star<=$this.curr_life){
    //             $(".life-wrapper .life:nth-child("+count_star+")").addClass("active");  
    //         }
    //         $(".life-wrapper .life:nth-child("+count_star+")").fadeIn(1000);
    //         $(".life-wrapper .life:nth-child("+count_star+")").css({"display":"inline-block"});            
    //     }
    //     else{
    //         clearInterval(time_star);
    //     }
    // },200); 

    // setTimeout(function(){
    //   $(".life-wrapper").show();
    // },500);

    if($this.curr_life == game.life_max){
      $(".life-wrapper .life").each(function(){
        if(!$(this).hasClass("active")){
          $(this).addClass("active")
        }
      });
    }else{
      for (var i = game.life_max; i > $this.curr_life; i--) {
        console.log("curr_life test");
        $(".life-wrapper .life:nth-child("+i+")").removeClass('active');
      }
    }

    $(".life-wrapper").show();
};

GameMultichoice.prototype.startGameTimer = function() {
    var $this = this;

    $(".timer").show();
    $this.timer = setInterval(function() {
        if($this.duration>0){
            $(".timer .text_time").html($this.setTimer(1));
        }
        else{
            clearInterval($this.timer);
            $this.timer = null;
            $(".timer .text_time").html("00:00");

            $("#popupSoalMultichoice").modal("hide");
            
            $("#popupGameClear .btn-wrapper .popupalert-yes").unbind().click(function(){
              // console.log("popupAlert");
              let src = "assets/audio/sound_button_quiz.wav";
              game.audio.audio_dynamic(src).play();

              $("#popupGameClear").modal("hide");

              $this.flag_stop_timer_card = 1;
              clearInterval($this.timer_interval);
              clearInterval($this.timer_card);

              let ldata = game.scorm_helper.getLastGame("game_slide_"+ $this.current_settings["slide"]);
              let answer_arr = [].concat(ldata["answer"]);

              for (var i = answer_arr.length; i < ldata["list_question"].length; i++) {
                 answer_arr.push(0);
              }

              // console.log(answer_arr);
              game.scorm_helper.setAnswer(answer_arr,ldata["list_question"]);

              let ldata2 = game.scorm_helper.getLastGame("game_slide_"+ $this.current_settings["slide"]);
              console.log(ldata2);

              $("#popupSoalMultichoice").modal("hide");

              //set undefined game data
              $this.game_data = {};
              game.scorm_helper.setSingleData("game_data", $this.game_data);

              game.nextSlide();
            });

            $("#popupGameClear").modal({
                backdrop: 'static',
                keyboard: true,
                show: true
            });

            // setTimeout(function(){
            //   $("#popupSoalMultichoice").modal("hide");
            // },1000)

            // $this.setResult(1);
        }
    },1000);
};

GameMultichoice.prototype.setTimer = function($flag) {
    var $this = this;
    
    if($flag == 1){
        $this.duration = $this.duration-1;
    }else{
        $this.duration = $this.duration;
    }
    game.scorm_helper.setSingleData("timer",$this.duration);
    var diffMunites = Math.floor($this.duration/60);
    var diffSec = Math.floor($this.duration%60);

    var str = '';
    if(diffMunites<10){
        str=str+"0"+diffMunites+":";
    }
    else if(diffMunites>=10){
        str=str+diffMunites+":";
    }

    if(diffSec<10){
        str=str+"0"+diffSec;
    }
    else if(diffSec>=10){
        str=str+diffSec;
    }

    return str;
};


GameMultichoice.prototype.showPopupList_2 = function(popupElement, curr_listSlider) {
  console.log("showPopupList_2");
  var $this = this;
  let cloneWrapper_2 = $(popupElement).find(".point_wrapper").first().clone();
  let cloneList_2 = $(popupElement).find(".point_wrapper_block").first().clone();
  $(popupElement).find(".slider_wrapper").html("");
  $(popupElement+ " .title").html($(this).find(".text_icon").html());
  $this.countSlide = curr_listSlider["list"].length;
  if(curr_listSlider["image_logo"]){
    $(popupElement+ " .logo_image").find("img").attr("src","assets/image/gameMultichoice/"+curr_listSlider["image_logo"]);
    $(popupElement).find(".logo_image").show();
  }else{
    $(popupElement).find(".logo_image").hide();
  }

  for (var m = 0; m < curr_listSlider["list"].length; m++) {
    var cWrapper = $(cloneWrapper_2).first().clone();
    cWrapper.html("");
    for(var n = 0; n < curr_listSlider["list"][m].length; n++){
      var cList = $(cloneList_2).first().clone();
      $(cList).find(".point_desc").html(curr_listSlider["list"][m][n]);
      $(cWrapper).append(cList);
    }
    $(popupElement).find(".slider_wrapper").append(cWrapper);
  }

  if(curr_listSlider["title"] == ""){
    $(popupElement).find(".title").hide();
  }else{
    $(popupElement).find(".title").html(curr_listSlider["title"]);
  }
  
  // console.log("test");
  $("#popupListFullScreen").on('shown.bs.modal', function () {
    let element = $("#popupListFullScreen .point_wrapper");
    console.log(element);
    if($(element)[0].offsetHeight < $(element)[0].scrollHeight){
      $(element).scrollTop(0);
      console.log("test");
      $("#popupListFullScreen .button_wrapper .button").addClass("disabled");
      $("#popupListFullScreen .point_wrapper").scroll(function(){
        // console.log($(this).scrollTop(), $(this).innerHeight(), ($(this).scrollTop()+$(this).innerHeight()), $(this)[0].scrollHeight);
        if($(this).scrollTop() + $(this).innerHeight() >= ($(this)[0].scrollHeight-2)) {
                $("#popupListFullScreen .button_wrapper .button").removeClass("disabled");
            }
      });
    }else{

    }
  });

  $("#popupListFullScreen").modal({backdrop: 'static',keyboard: true,show: true});


  console.log($(popupElement));
  console.log($(popupElement+ " .button_wrapper"));
  $(popupElement+ " .button_wrapper").click(function(e){
    let src = "assets/audio/sound_button_popup.wav";
    game.audio.audio_dynamic(src).play();
    if(!$(this).hasClass("disabled")){
      $(this).off();

      $this.startGameTimer();
      $this.setTimerCard();
      $(popupElement).modal("hide");
    }
  });

  if(curr_listSlider["list"].length > 1){
    // $this.sliderPopup();
    $(popupElement+ " .button_wrapper").hide();
  }
}

GameMultichoice.prototype.setTutorialSlider = function() {
  var $this = this;
  $("#tutorial .tutorial").removeClass("active");
  $("#tutorial .tutorial.ho").addClass("done");
  $("#tutorial .tutorial.ho").addClass("active");
  $("#tutorial").modal({backdrop: 'static',keyboard: true,show: true});
  $("#tutorial .tutorial.ho").find("div").first().not('.slick-initialized').slick({
      dots: true,
      infinite: false,
      speed: 500,
      prevArrow: false,
      nextArrow: false
  });
  // $(window).trigger('resize');

  $("#tutorial .tutorial.ho").find(".start-game").unbind().click(function(e){
    let src = "assets/audio/sound_button_slider.wav";
    game.audio.audio_dynamic(src).play();
    $("#tutorial").modal('hide');
    // game.nextSlide();

    //set life
    if($this.life_mode){
      // console.log($this.game_data);
      $this.curr_life = ($this.game_data["curr_life"] != undefined ? $this.game_data["curr_life"] : game.life_max);
      // $this.curr_life = (game.game_data["curr_life"] != undefined ? game_data["curr_life"] : 2);
      $this.setLife();
    }

    console.log("$this.duration: ",$this.duration);
    $(".gesture_wrapper").show();
    $(".timer").show();
    $(".gesture_wrapper").unbind().click(function(){
        let src = "assets/audio/Points1.wav"
        game.audio.audio_dynamic(src).play();

        $(this).hide();

        if($this.duration){
            $this.startGameTimer();
        }
    });

     $this.createData();
  });
};