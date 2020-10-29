var Audio = function(){
	this.audioButton = document.createElement('audio');
    this.audioButton.setAttribute('src', 'assets/audio/sound_button.wav');

   	this.audioBenar = document.createElement('audio');
	this.audioBenar.setAttribute('src', 'assets/audio/SFX Benar.mp3');

	this.audioSalah = document.createElement('audio');
	this.audioSalah.setAttribute('src', 'assets/audio/SFX Salah.mp3');

	this.audioKalah = document.createElement('audio');
	this.audioKalah.setAttribute('src', 'assets/audio/SFX Kalah.mp3');

	this.audioMenang = document.createElement('audio');
	this.audioMenang.setAttribute('src', 'assets/audio/SFX Menang.mp3');

	this.audioBackground = document.createElement('audio');
	this.audioBackground.setAttribute('src', 'assets/audio/backsound.mp3');

	this.audioSubmit = document.createElement('audio');
	this.audioSubmit.setAttribute('src', 'assets/audio/submit.mp3');

	this.audioBackgroundSlider = document.createElement('audio');
	this.audioBackgroundSlider.setAttribute('src', 'assets/audio/backsound.mp3');

	this.audio_dynamic = function(src){
		console.log(src);
		this.audioDynamic = document.createElement('audio');
		this.audioDynamic.setAttribute('src', src);
		return this.audioDynamic;
	}
}