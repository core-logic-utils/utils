
let currentSong = new Audio; // It is variable which help me to play one song at a time.
let currentFolder; //Making currentFolder as global variable so that the folder will be accessed by all functions where folder is not defined like --> await fetch(path)

let songs; // Making songs global variable to help in previous/next;
let thumbnails;

// Convert seconds to Minutes : Seconds format
function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }
    // Get total minutes
    let minutes = Math.floor(seconds / 60);

    // Get remaining seconds
    let remainingSeconds = Math.floor(seconds % 60);

    // Add leading zero if needed
    let formattedMinutes = String(minutes).padStart(2, "0");
    let formattedSeconds = String(remainingSeconds).padStart(2, "0");

    // Return in mm:ss format
    return `${formattedMinutes}:${formattedSeconds}`;
}


function getSongNameOnly(song) {

    let songNameWithoutTracks = decodeURIComponent(song.split(`${currentFolder}/`)[1]); // spliting song link by FolderName/Tracks/ then decoding . For eg- For eg- Old%20is%20Gold/Tracks.
    // Here I added extra / because when calling getSongs from main it will be given argument like ("Old%20is%20Gold/Tracks") so when this folder came here in this getSongNameOnly function it will be splitted out by FolderName/Tracks not FolderName/Tracks/. So a / will be seen in sidebarContainer

    let songNameWithoutArtist = songNameWithoutTracks.split(" - ")[1]; // Here splitting song name part by artist name which was before " - "
    let songNameWithoutMp3 = songNameWithoutArtist.split(".mp3")[0]; // spliting .mp3 part also
    return (songNameWithoutMp3.replaceAll("%20", " ")); // Returning song name without %20

}

function getSongArtistOnly(song) {

    let songNameWithoutTracks = decodeURIComponent(song.split(`${currentFolder}/`)[1]); // spliting song link by FolderName/Tracks/ then decoding . For eg- For eg- Old%20is%20Gold/Tracks.
    // Here I added extra / because when calling getSongs from main it will be given argument like ("Old%20is%20Gold/Tracks") so when this folder came here in this getSongNameOnly function it will be splitted out by FolderName/Tracks not FolderName/Tracks/. So a / will be seen in sidebarContainer
    let artistName;
    if (songNameWithoutTracks.includes(" - ")) {
        artistName = songNameWithoutTracks.split(" - ")[0]; // Here splitting song name part by artist name which was before " - "
    } else {
        artistName = "Unknown Artist"; // fallback
    }

    return (artistName.replaceAll("%20", " ")); // Returning Artist name without %20

}


async function getSongs(folder) {
    currentFolder = folder; // Assigning the folder name to currentFolder
    // Here folder will be FolderName/Tracks For eg- Old%20is%20Gold/Tracks
    let p = await fetch(`http://127.0.0.1:5500/Playlists/${folder}/`); // Fetching Songs from custom folder. Here p is a promise
    let response = await p.text(); // getting text inside the promise in response
    let div = document.createElement("div"); // Creating a div element to store the response text
    div.innerHTML = response; // Putting text/Html inside response in div 
    let li = div.querySelectorAll("li");
    songs = [] // Creating songs array to store links of songs


    thumbnails = [] // Creating thumbnails array to store links of thumbnails
    Array.from(li).forEach((e) => { // Creaing array from li and looping through each li
        let links = e.querySelector("a").href; // Getting links of songs and thumbnail which are under li > a;

        if (links.endsWith(".mp3")) { // Sorting links which is mp3 only not any other href.
            songs.push(links) // Pushing links to songs Array

        }

        if ((links.endsWith(".jpeg")) || (links.endsWith(".jpg"))) { // Sorting links which is jpeg or jpg only not any other href.
            thumbnails.push(links) // Pushing links thumbnails Array

        }
    }
    );

    // Adding all the songs amd thumbnail in Playlist
    let sidebarContainer = document.querySelector(".sidebarContainer");
    sidebarContainer.innerHTML = "" // Emptying the Html inside sidebarContainer so that song will not repeateadily append

    for (let i = 0; i < songs.length; i++) {
        let song = songs[i];
        let thumbnail = thumbnails[i] || '/img/No_Image_Available.jpg'; // Get corresponding thumbnail or set default thumbnail to No_Image_Available.jpg

        sidebarContainer.innerHTML += `
        <div class="song cursorPointer flexBox">
            <div class="songThumbnail">
                <img src="${thumbnail}" alt="Image">
            </div>
            <div class="songDetails flexBox justifyContentCenter">
                <a hidden class="songLink" href="${song}"></a>
                <div class="songTitle">${getSongNameOnly(song)}</div>
                <div class="songArtist">${getSongArtistOnly(song)}</div>
            </div>
        </div>
    `;
    }



    //Attaching event listener to each song
    Array.from(document.body.querySelector(".sidebarContainer").querySelectorAll(".song")).forEach((e) => { // Make array of all song div and loop through each element
        e.addEventListener("click", (element) => {
            let anchorTag = e.querySelector(".songDetails").querySelector(".songLink");
            let songThumbnail = e.querySelector(".songThumbnail > img").src;
            playMusic(anchorTag.href, songThumbnail);
            console.log(anchorTag.href, songThumbnail)
        }
        )
        // console.log(e.querySelector(".songTitle").innerHTML) // Song Name
    }
    );




    return songs;
}

//Used to Display the playlists/albums
async function displayAlbums() {
    let p = await fetch(`http://127.0.0.1:5500/Playlists/`); // Fetching all folder inside Playlists
    let response = await p.text(); // getting text inside the promise in response
    let div = document.createElement("div"); // Creating a div element to store the response text
    div.innerHTML = response; // Putting text/Html inside response in div 
    let li = div.querySelectorAll("li");
    let albums = [] // Creating albums array to store links of folder 
    let spotifyPlaylists = document.body.querySelector(".spotifyPlaylists");

    let array = Array.from(li);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // Creaing array from li and looping through each li
        let links = e.querySelector("a").href; // Getting links of folder which are under li > a;
        if (links.includes("/Playlists/")) { // Sorting links which contains /Playlists/ only, not any other href.
            albums.push(links); // Pushing links to albums Array
            let folder = links.split("/Playlists/")[1]; // Getting folder Name spliting by /Playlists/

            // Getting the metadata of folder
            let f = await fetch(`http://127.0.0.1:5500/Playlists/${folder}/info.json`); // Fetching info.json that is in folder inside Playlists
            let response = await f.json(); // getting text inside the promise in response

            //Here ${folder} is folder name like Old is Gold and ${response.title} and ${response.artist} are the title and artist name inside the info.json respectively
            spotifyPlaylists.innerHTML = spotifyPlaylists.innerHTML + `<div data-album="${folder}" class="cardContainer flexBox justifyContentCenter alignItemsCenter">
                    <div class="cardCoverImage">
                        <img src="/Playlists/${folder}/cover.jpg" alt="">
                    </div>
                    <div class="cardTitle">${response.title}</div>
                    <div class="cardArtist">${response.artist}</div>
                </div> `
        }
    }

    // Show the Tracks whenever the cardContainer is clicked
    Array.from(document.querySelector(".spotifyPlaylists").querySelectorAll(".cardContainer")).forEach((e) => {

        e.addEventListener("click", async (items) => {
            //currentTarget help to get dataset of whole cardContainer not each elements of card
            // items.currentTarget.dataset.folder gives me the content inside data-folder = "content"
            songs = await getSongs(`${(items.currentTarget.dataset.album)}/Tracks`);
            playMusic(songs[0], thumbnails[0]); // Play the first song whenever album is clicked
        }
        )
    }
    );
}




const playMusic = (track, cover, paused = false) => {
    // let audio = new Audio(track);
    currentSong.src = track;
    currentSong.preload = "none"; // Stop automatic downloading
    currentSong.volume = parseInt(document.querySelector("#volume").value) / 100; // When playing song play at that volume which was already set on {input type= "range" id-volume}
    if (!paused) {
        currentSong.play();
        play.src = "/img/pause.svg" // Selecting play by id directly and converting to pause img whenever songs plays
    }
    document.body.querySelector(".footerBox1").querySelector(".footerSongDetails").querySelector(".footerSongTitle").innerHTML = getSongNameOnly(track); // Assigning song Name to footer
    document.body.querySelector(".footerBox1 > .footerSongDetails > .footerSongArtist").innerHTML = getSongArtistOnly(track); // Assigning song Artist to footer

    document.body.querySelector(".footerBox1").querySelector(".footerSongCover > img").src = cover || '/img/No_Image_Available.jpg'; // Assigning song thumnail to footer
}


async function main() {
    // Getting the list of all songs
    // songs = await getSongs("Old%20is%20Gold/Tracks"); // getSongs is promise so we use await to not get pending promise
    await getSongs("Old%20is%20Gold/Tracks"); // getSongs is promise so we use await to not get pending promise
    playMusic(songs[0], thumbnails[0], true)

    //Display all the playlists/Albums in the page
    displayAlbums();


    // Attaching event listener to play/pause button
    play.addEventListener("click", () => { // We can directly select by id. Dont need to do getElementbyId
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/img/pause.svg"
        } else {
            currentSong.pause();
            play.src = "/img/play.svg"
        }
    }
    )

    // Listen to time update and move seekbar also
    currentSong.addEventListener("timeupdate", () => {
        document.body.querySelector(".footerBox3").querySelector(".duration").innerHTML = `${secondsToMinutes(currentSong.currentTime)} : ${secondsToMinutes(currentSong.duration)}`

        document.body.querySelector(".footerBox2").querySelector(".seekbar").querySelector(".seekbarLine").querySelector(".seekbarCircle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    }
    )

    // Add an event listener to seekbar
    document.body.querySelector(".seekbar").querySelector(".seekbarLine").addEventListener("click", (e) => {
        // By dividing e.offsetX (the horizontal position relative to the element's left edge) by the element's total width, the expression normalizes the mouse's horizontal position to a value between 0 and 1.
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        // Making seekbar circle move left right
        document.body.querySelector(".footerBox2").querySelector(".seekbar").querySelector(".seekbarLine").querySelector(".seekbarCircle").style.left = percent + "%";

        // Making seekbar circle changing the currentTime of song
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    }
    )

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src)
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1], thumbnails[index - 1] || '/img/No_Image_Available.jpg');
        }
        else {
            playMusic(songs[(songs.length) - 1], thumbnails[(songs.length) - 1] || '/img/No_Image_Available.jpg');
        }
    }
    )

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        currentSong.pause();

        let index = songs.indexOf(currentSong.src)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1], thumbnails[index + 1] || '/img/No_Image_Available.jpg');
        }
        else {
            playMusic(songs[0], thumbnails[0] || '/img/No_Image_Available.jpg'); // If songs are unavailable for next it starts from beginning
        }
    }
    )

    // Add an event listener to volume
    volume.addEventListener("change", (e) => { // volume is id of input type range
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >= 0.6) {
            (document.querySelector(".footerBox3 > .volume > img").src) = "/img/volume-high.svg"
        }
        else if (currentSong.volume < 0.6 && currentSong.volume > 0) {
            (document.querySelector(".footerBox3 > .volume > img").src) = "/img/volume-low.svg"

        }
        else {

            (document.querySelector(".footerBox3 > .volume > img").src) = "/img/volume-mute.svg"
        }
    }
    );


    // Add an event listener to volume/mute

    let lastVolume = 1; // store previous volume (default 100%)

    document.querySelector(".footerBox3 > .volume > img").addEventListener("click", (e) => {
        console.log(e.target.src);

        // If currently unmuted
        if (e.target.src.includes("/img/volume-high.svg") || e.target.src.includes("/img/volume-low.svg")) {
            lastVolume = currentSong.volume; // save current volume
            e.target.src = "/img/volume-mute.svg";
            currentSong.volume = 0;
        }
        // If currently muted
        else {
            currentSong.volume = lastVolume; // restore saved volume
            if (lastVolume >= 0.6) {
                e.target.src = "/img/volume-high.svg";
            } else {
                e.target.src = "/img/volume-low.svg";
            }
        }
    });

// Select elements
const hamburger = document.querySelector("main > aside > .asideHamburger");
const aside = document.querySelector("main > aside");
const section = document.querySelector("main > section");
const cross = document.querySelector("main > aside > .sidebarHeading > .crossIcon");

// Store section’s initial width (use computed style to get actual width)
const sectionInitialWidth = section.style.width;

// Hamburger click → open sidebar
hamburger.addEventListener("click", () => {
  const asideChildren = document.querySelectorAll("aside > div:not(:first-child)");

  // Expand sidebar
  aside.style.width = "50vw";
  section.style.width = "50vw";

  // Show all children inside aside
  asideChildren.forEach(div => div.style.display = "flex");

  // Hide hamburger icon
  hamburger.style.display = "none";
});

// Cross click → close sidebar
cross.addEventListener("click", () => {
  const asideChildren = document.querySelectorAll("aside > div:not(:first-child)");

  // Collapse sidebar
  aside.style.width = "12vw";
  section.style.width = sectionInitialWidth;

  // Hide aside children
  asideChildren.forEach(div => div.style.display = "none");

  // Show hamburger icon again
  hamburger.style.display = "flex";
});

}
main();