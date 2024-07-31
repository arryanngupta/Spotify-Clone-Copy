function formatTime(seconds) {

    if(isNaN(seconds) || seconds<0){
        return "0:00";
    }
    // Calculate whole minutes and remaining seconds
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    remainingSeconds = remainingSeconds.toFixed(0);

    // Format the remaining seconds to always display two digits
    let formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;


    // Return the formatted time as a string
    return `${minutes}:${formattedSeconds}`;
}

let songs;
let artists;
let currentFolder;

let songLI;
async function getSongs(folder) {
    currentFolder = folder;

    let a = await fetch(`assests/songs/${currentFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    artists = [];

    for (let i = 0; i < as.length; i++) {
        if (as[i].href.endsWith(".mp3")) {
            songs.push(as[i].href.split(`/${currentFolder}/`)[1].replaceAll("%20", " "));
            artists.push(as[i].href.split(`/${currentFolder}/`)[1].replaceAll("%20", " ").split("-")[1].slice(0,-4));
           // console.log(as[i].href.split(`/${currentFolder}/`)[1].replaceAll("%20", " ").split("-")[1].slice(0,-4));
            
        }
    }

    // Show all the songs in the playlist 
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (let i = 0; i < songs.length; i++) {
        songUL.innerHTML += `<li>
        <i class="fa-solid fa-music"></i>
         <div class="song-info">
                                <p class="song-name">${songs[i]}</p>
                                <p class="artist-name">${artists[i]}</p>
                            </div>
                            <i class="fa-regular fa-circle-play"></i>
        </li>`;
    }


     songLI = document.querySelector(".song-list").getElementsByTagName("li");

    for (let i = 0; i < songLI.length; i++) {
        songLI[i].addEventListener("click", function () {
            console.log(songLI[i].querySelector(".song-name").innerHTML);
            PlayMusic(songs[i]);
            document.querySelector(".song").innerHTML = songLI[i].querySelector(".song-name").innerHTML;
            document.querySelector(".artist").innerHTML = songLI[i].querySelector(".artist-name").innerHTML;
        })
    }

    return songs;
}

let currentSong = new Audio();
var started = false;
function PlayMusic(track) {
    // let audio = new Audio("./assests/songs/" + track);
    currentSong.src = `./assests/songs/${currentFolder}/` + track;
    currentSong.play();
    document.querySelector(".player").setAttribute("class", "player fa-solid fa-circle-pause");
    started = true;
}

async function displayAlbum(){
    let a = await fetch("/assests/songs/");
    let response = await a.text();
    //console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
    for(let i = 0;i<array.length;i++){
        const e = array[i];
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
            //console.log(e.href.split("/songs/")[1].slice(0,-1));
            
            let folder = e.href.split("/songs/")[1].slice(0,-1);
            // Get the metadata of the folder;
            let a = await fetch(`/assests/songs/${folder}/info.json`);
            let response = await a.json();
            //console.log(response);
            document.querySelector(".card-container").innerHTML = document.querySelector(".card-container").innerHTML + `<div data-folder=${folder} class="card">
                        <img src="./assests/songs/${folder}/img-one.jpg" />
                        <div class="play">
                            <i class="fa-solid fa-play"></i>
                        </div>
                        <p><b>${response.title}</b></p>
                        <p class="description">${response.description}</p>
                    </div>`

        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(function(e){
        e.addEventListener("click",async function(item){
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            PlayMusic(songs[0]);
            document.querySelector(".song").innerHTML = songLI[0].querySelector(".song-name").innerHTML;
            document.querySelector(".artist").innerHTML = songLI[0].querySelector(".artist-name").innerHTML;
        })
    })
    
    

}

let repeat = false;
function repeatSong(){

       let currentSongIndex = songs.indexOf((currentSong.src.replaceAll("%20"," ").split(`/songs/${currentFolder}/`))[1]);
       PlayMusic(songs[currentSongIndex]);
       

}

function shuffleSong(){
    let random = Math.floor(Math.random()*songs.length);
    let currentSongIndex = songs.indexOf((currentSong.src.replaceAll("%20"," ").split(`/songs/${currentFolder}/`))[1]);
    if(currentSongIndex<=songs.length-1){
    PlayMusic(songs[random]);
    document.querySelector(".song").innerHTML = songLI[random].querySelector(".song-name").innerHTML
}
}

async function main() {
    songs = await getSongs("album-1");
    //console.log(songs);

    //Display all the albums in the page
    displayAlbum();

    let repeatClicked = false;

    document.querySelector(".repeat").addEventListener("click", function() {
        if (!repeatClicked) {
            document.querySelector(".repeat").style.color = "white";
            repeatClicked = true;
        } else {
            document.querySelector(".repeat").style.color = "#91959a";
            repeatClicked = false;
        }
    });
    
currentSong.addEventListener("ended",function(){
    if(repeatClicked){
        repeatSong();
    }
});
    
    


let repeatShuffle = false;
document.querySelector(".shuffle").addEventListener("click",function(){
    if(!repeatShuffle){
        document.querySelector(".shuffle").style.color = "white";
        repeatShuffle = true;
    }
    else{
        document.querySelector(".shuffle").style.color = "#91959a";
        repeatShuffle = false;
    }
});

currentSong.addEventListener("ended", function() {
    if (repeatShuffle) {
        shuffleSong(); // Call shuffleSong() when repeatShuffle is true and song ends
    }
    console.log("song is ended");
    
});

    

    if (!started) {
        document.querySelector(".song").innerHTML = songLI[0].querySelector(".song-name").innerHTML;
        document.querySelector(".artist").innerHTML = songLI[0].querySelector(".artist-name").innerHTML;
    }

    document.querySelector(".player").addEventListener("click", function () {
        if (!started) {
            PlayMusic(songs[0]);
        }

        else if (currentSong.paused) {
            currentSong.play();
            document.querySelector(".player").setAttribute("class", "player fa-solid fa-circle-pause");
        }
        else {
            currentSong.pause();
            document.querySelector(".player").setAttribute("class", "fa-solid fa-circle-play player");
        }
    })

    currentSong.addEventListener("timeupdate", function () {
        document.querySelector(".play-time").innerHTML = `${formatTime(currentSong.currentTime)}`;
        document.querySelector(".song-time").innerHTML = `${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".seek-bar").style.background = `linear-gradient(to right,#1DB954 ${ (currentSong.currentTime / currentSong.duration) * 100}%,#91959a ${ (currentSong.currentTime / currentSong.duration) * 100}%)`;

    })

    document.querySelector(".seek-bar").addEventListener("click", function (e) {
        console.log((e.offsetX / e.target.getBoundingClientRect().width) * 100);

        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime = (currentSong.duration * (e.offsetX / e.target.getBoundingClientRect().width) * 100) / 100;
    });



    document.querySelector(".nav-icons").firstElementChild.addEventListener("click", function () {
        document.querySelector(".left-section").style.left = "0";
    })

    document.querySelector(".home-section").getElementsByTagName("i")[0].addEventListener("click",function(){
        document.querySelector(".left-section").style.left = "-100%";
    }
)


    document.querySelector(".previous").addEventListener("click",function(){
        //console.log((currentSong.src.replaceAll("%20"," ").split("/songs/"))[1]);
        //console.log(songs);
        
        let index = songs.indexOf((currentSong.src.replaceAll("%20"," ").split(`/songs/${currentFolder}/`))[1]);
        //console.log(index);
        PlayMusic(songLI[index-1].querySelector(".song-name").innerHTML);
        document.querySelector(".song").innerHTML = songLI[index-1].querySelector(".song-name").innerHTML
    })

    document.querySelector(".next").addEventListener("click",function(){
        //console.log((currentSong.src.replaceAll("%20"," ").split("/songs/"))[1]);
        //console.log(songs);
        
        let index = songs.indexOf((currentSong.src.replaceAll("%20"," ").split(`/songs/${currentFolder}/`))[1]);
        //console.log(index);
        PlayMusic(songLI[index+1].querySelector(".song-name").innerHTML);
        document.querySelector(".song").innerHTML = songLI[index+1].querySelector(".song-name").innerHTML
 })

    document.querySelector(".seek-bar-vol").getElementsByTagName("input")[0].addEventListener("change",function(e){
        //console.log(e.target.value);
        currentSong.volume = parseInt(e.target.value)/100;

        toggleVol();
        
        document.querySelector(".seek-bar-vol").getElementsByTagName("input")[0].style.background = `linear-gradient(to right, #1DB954 ${currentSong.volume*100}%, #A4ABB3 ${currentSong.volume*100}%)`;


    })


    function toggleVol(){

    if(currentSong.volume == 0){
        document.querySelector(".song-options").getElementsByTagName("i")[0].setAttribute("class","light-up fa-solid fa-volume-xmark");
        document.querySelector(".seek-bar-vol").getElementsByTagName("input")[0].value = 0;
    }
    else{
        document.querySelector(".song-options").getElementsByTagName("i")[0].setAttribute("class","light-up fa-solid fa-volume-high");
        document.querySelector(".seek-bar-vol").getElementsByTagName("input")[0].value = currentSong.volume*100;

    }
}
    
    document.querySelector(".song-options").getElementsByTagName("i")[0].addEventListener("click",function(){
        
        if(currentSong.volume != 0){
        currentSong.volume = 0;
        toggleVol();
    }
        else{
            currentSong.volume = 0.1;
            toggleVol();
        }
    })









    // var audio = new Audio(songs[0]);
    // audio.play();
}


main();