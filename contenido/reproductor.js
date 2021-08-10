var video;
var fullScreenActivada;

$(document).ready(function(){

    // Video
    video = document.getElementById("myVideo");

    // Controles
    controls = document.getElementById("reproductor");

    // Player
    player = document.getElementById("player");
  
    // Buttons
    var playButton = document.getElementById("play_pause");
    var prev10s = document.getElementById("-10s");
    var next10s = document.getElementById("+10s");
    var subtitles = document.getElementById("sub");
    var fullscreen = document.getElementById("fullscreen");
    
    // Sliders
    var timeBar = document.getElementById("timeSlider");
    var volumeBar = document.getElementById("volSlider");
  
    // Texto
    var tiempo = document.getElementById("tiempo");

    // Inicialización variables
    timeBar.value = 0;
    volumeBar.value = 0.25;
    fullScreenActivada = false;

    

    // Añadimos todos los event listeners
    playButton.addEventListener("click",function(){
        if (video.paused){
            video.play();
            document.getElementById("botonPP").src = "iconos/pausa.svg";
        }else{
            video.pause();
            document.getElementById("botonPP").src = "iconos/play2.svg";
        }
    });

    video.addEventListener("click", function() {
        if (video.paused){
            video.play();
            document.getElementById("botonPP").src = "iconos/pausa.svg";
        }else{
            video.pause();
            document.getElementById("botonPP").src = "iconos/play2.svg";
        }
    });

    video.addEventListener("timeupdate",function(){
        //Tiempo actual
        let segundos = Math.floor(video.currentTime % 60);
        let minutos = Math.floor(video.currentTime / 60);
        segundos = segundos >= 10 ? segundos : '0' + segundos;

        //Tiempo total
        let segTot = Math.floor(video.duration % 60);
        let minTot = Math.floor(video.duration / 60);
        segTot = segTot >= 10 ? segTot : '0' + segTot;
        var tiempoTotal = `${minTot}:${segTot}`;

        tiempo.innerText = `${minutos}:${segundos} / ${tiempoTotal}`;

        //Actualizamos la barra
        let posBarra = (video.currentTime / video.duration) * 10000;
        timeBar.value = posBarra;
        //Pintamos la barra
        var x = (timeBar.value/10000) *100;
        if(x<15 && !fullScreenActivada){
            x+=1;
        }
        var color = 'linear-gradient(90deg, rgb(0, 0, 0)' + x + '%, rgb(255, 255, 255, 0)' + x + '%)';
        timeBar.style.background = color;
    });

    timeBar.addEventListener("change", function() {
        // Calcular el tiempo nuevo
        var time = video.duration * (timeBar.value / 10000);
      
        // Actualizar el tiempo de video
        video.currentTime = time;
    });

    volumeBar.addEventListener("change", function(){
        //Actualizamos el volumen con el valor del slider
        if (volumeBar.value > 0) {
            video.muted = false;
            document.getElementById("volImg").src = "iconos/volumen.svg";
        }
        else {
            video.muted = true;
            document.getElementById("volImg").src = "iconos/mute.svg";
        }
        video.volume = volumeBar.value;
    });

    prev10s.addEventListener ("click", function() {
        if (video.currentTime <= 10) {
            video.currentTime = 0;
        } else {
            video.currentTime -= 10;
        }
    });

    next10s.addEventListener ("click", function() {
        if (video.currentTime + 10 >= video.duration) {
            video.currentTime = video.duration;
        } else {
            video.currentTime += 10;
        }
    });

    subtitles.addEventListener("click", function() {
        document.getElementById("idiomas").classList.toggle("show");
    });

    fullscreen.addEventListener("click", function(){
        if (!isInFullScreen()) {
            fullScreenActivada = true;
            if (player.requestFullscreen) {
                player.requestFullscreen();
            } else if (player.mozRequestFullScreen) {
                player.mozRequestFullScreen();
            } else if (player.webkitRequestFullScreen) {
                player.webkitRequestFullScreen();
            } else if (player.msRequestFullscreen) {
                player.msRequestFullscreen();
            }
        } else {
            fullScreenActivada = false;
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        setVideoSize();
    });

   player.addEventListener("mouseover", function() {
        $("#reproductor").css("visibility","visible");
   });

   player.addEventListener("mouseout", function() {
        $("#reproductor").css("visibility","hidden");
    });

});

// Funciones

function cambiarSubtitulos(idioma) {
    for (var i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = 'hidden';
    }

    document.getElementById("subEsp").classList.remove("subactivo");
    document.getElementById("subEng").classList.remove("subactivo");
    document.getElementById("subNone").classList.remove("subactivo");

    // Elegir los subtitulos
    if (idioma == "es") {
        video.textTracks[2].mode = "showing";
        document.getElementById("subEsp").classList.add("subactivo");
    } else if (idioma == "en") {
        video.textTracks[1].mode = "showing";
        document.getElementById("subEng").classList.add("subactivo");
    } else {
        document.getElementById("subNone").classList.add("subactivo");
    }

    document.getElementById("idiomas").classList.toggle("show");
}

function setVideoSize() {
    if(fullScreenActivada){
        player.style.width = 'window.innerWidth';
    }else{
        player.style.width = '100%';
    }
  }

  function isInFullScreen(){
    return (document.fullscreenElement && document.fullscreenElement !== null) ||
    (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
    (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
    (document.msFullscreenElement && document.msFullscreenElement !== null);
}
