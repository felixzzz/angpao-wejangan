var Parallax = function(){
	
}

Parallax.prototype.init = function(current_settings) {
	$this = this;
	$this.current_settings = current_settings;
	$this.parallax_items = $(".parallax_items").first().clone();
	$this.background = $(".parallax_bg").first().clone();
	$this.box = $(".box").first().clone();
	$this.button = $(".button").first().clone();
	$(".parallax_wrapper").html("");
	//$(".box").remove();
	$.get("config/setting_parallax_slide_"+$this.current_settings["slide"]+".json",function(e){
		$this.list_bg = e["list_bg"];
		$this.list_box = e["list_box"];
		$this.setBG();
		//$this.setBox();
	},"json");
};

/*Parallax.prototype.setBG = function() {
	$this = this;
	for(i = 0; i < $this.list_bg.length; i++){
		$clone = $this.background.clone();
		$clone.attr("src","assets/image/parallax/"+$this.list_bg[i]);
		$(".parallax_wrapper").append($clone);
	}
};

Parallax.prototype.setBox = function() {
	$this = this;
	for(i = 0; i < $this.list_box.length; i++){
		$clone = $this.box.clone();
		$clone.attr("data-aos","fade-"+$this.list_box[i]["fade"]);
		$clone.css($this.list_box[i]["position"]);
		if($this.list_box[i]["image"]){
			$clone.find("img").attr("src","assets/image/parallax/"+$this.list_box[i]["image"]);
		}else{
			$clone.find("img").remove();
		}
		if($this.list_box[i]["text"]){
			$clone.find("p").html($this.list_box[i]["text"]["text"]);
			$clone.find("p").css($this.list_box[i]["text"]["css"]);
		}else{
			$clone.find("p").remove();
		}
		$("#content").append($clone);
	}
};*/

Parallax.prototype.setBG = function() {
	$this = this;
	for(i = 0; i < $this.list_bg.length; i++){
		$clone = $this.parallax_items.clone();
		$clone.html("");
		if($this.list_bg[i]["list_box"]){
			for(j = 0; j < $this.list_bg[i]["list_box"].length; j++){
				$clone_box = $this.box.clone();
				$clone_box.attr("data-aos","fade-"+$this.list_bg[i]["list_box"][j]["fade"]);
				$clone_box.css($this.list_bg[i]["list_box"][j]["position"]);
				if($this.list_bg[i]["list_box"][j]["image"]){
					$clone_box.find("img").attr("src","assets/image/parallax/"+$this.list_bg[i]["list_box"][j]["image"]);
				}else{
					$clone_box.find("img").remove();
				}
				if($this.list_bg[i]["list_box"][j]["text"]){
					$clone_box.find("p").html($this.list_bg[i]["list_box"][j]["text"]["text"]);
					$clone_box.find("p").css($this.list_bg[i]["list_box"][j]["text"]["css"]);
				}else{
					$clone_box.find("p").remove();
				}
				$clone.append($clone_box);
			}
		}
		if($this.list_bg[i]["button"]){
			$clone_button = $this.button.clone();
			$clone_button.html($this.list_bg[i]["button"]["text"]);
			$clone_button.css($this.list_bg[i]["button"]["position"]);
			$clone.append($clone_button);
			$clone_button.click(function(e){
				$(this).off();
				game.nextSlide();
			});
		}
		$clone_bg = $this.background.clone();
		$clone.append($clone_bg);
		$clone.find(".parallax_bg").attr("src","assets/image/parallax/"+$this.list_bg[i]["background"]);
		$(".parallax_wrapper").append($clone);
	}
	setTimeout(function(){
		AOS.init();
	},1000);
};