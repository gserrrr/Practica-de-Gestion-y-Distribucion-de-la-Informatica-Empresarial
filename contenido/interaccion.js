var tiempos = [];
var videoElement;
var ultimosIngredientes = [];

$(document).ready(function(){
    videoElement = document.getElementById('myVideo');
    //guardamos las textTracks del video
    var textTracks = videoElement.textTracks; 
    //textTrack metadata
    var textTrack = textTracks[0]; 
    textTrack.mode = "showing"; 
    //textTrack subtítulos
    var subEng = textTracks[1]; 
    subEng.mode = "hidden";
    var subEsp = textTracks[2]; 
    subEsp.mode = "hidden";

    
    document.getElementById("trackMetadatos").addEventListener("load", function() {
        var allCues = textTrack.cues;
        
        for(let i = 0; i< allCues.length; i++){
            var info = JSON.parse(allCues[i].text);

            // Añadir el tiempo al array de tiempos
            tiempos.push(allCues[i].startTime);

            // Ponemos los pasos
            $("#listaPasos").append("<li id='paso" + i + "'></li>");
            $("#paso" + i).append("<button onclick='cambiarTiempo(" + i + ")'>"+ info.title +"</button>");

            // Ponemos los ingredientes
            for(let j = 0; j < info.ingredientes.length; j++){
                $("#listaIngredientes").append("<li id='" + info.ingredientes[j] + "'></li>");
                $("#"+ info.ingredientes[j]).append("<button onclick='cambiarTiempo(" + i + ")'></button>");
                $("#"+ info.ingredientes[j]).find("button").append("<img class='imging' src='" + info.imagen[j] + "'>");
                $("#"+ info.ingredientes[j]).find("button").append("<p>" + info.textoIngrediente[j] + "</p>");
            }
            
        }
    }, false);

    textTrack.addEventListener('cuechange', function () {
        document.getElementById('desc').style.display = 'block';
        var datos = JSON.parse(textTrack.activeCues[textTrack.activeCues.length - 1].text);
        //Actualizamos el título de la descripción
        var tituloDesc = document.getElementById('pasoActual');
        tituloDesc.innerHTML = datos.title;
        //Actualizamos la descripción
        var textoDesc = document.getElementById('descripcion');
        textoDesc.innerHTML = datos.description;
        //Actualizamos el paso actual resaltado
        var titulillo = textTrack.activeCues[textTrack.activeCues.length - 1].id;
            //Reseteamos todo (pasos e ingredientes)
        $("li").css("background-color","white");
        $("li").find('button').css("font-weight","Normal");
        $("li").find('button').css("color","black");
            //Resetear las imágenes
        for(let i = 0; i<ultimosIngredientes.length; i++){
            $("#"+ultimosIngredientes[i]).find('img').attr("src","iconos/blanco/"+ultimosIngredientes[i]+".svg");
        }
            
        var idPaso = "paso" + titulillo;
            //Marcamos el paso en concreto
        $("#"+idPaso).css("background-color","#292929");
        $("#"+idPaso).find('button').css("font-weight","Bold");
        $("#"+idPaso).find('button').css("color","white");
        //Actualizamos los ingredientes utilizados
        ultimosIngredientes = [];
        if(datos.ingredientes.length > 0){
            for (let i = 0; i < datos.ingredientes.length; i++) {
                $("#"+datos.ingredientes[i]).css("background-color","#d9d9d9");
                $("#"+datos.ingredientes[i]).find('button').css("font-weight","Bold");
                $("#"+datos.ingredientes[i]).find('img').attr("src","iconos/color/"+datos.ingredientes[i]+".svg");
                ultimosIngredientes.push(datos.ingredientes[i]);
            }
        }
    });
});


function cambiarTiempo(tiempo){
    videoElement.currentTime = tiempos[tiempo];
}

