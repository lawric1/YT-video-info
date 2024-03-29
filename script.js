function getParsedDuration(duration) {
    let durationArray = duration.slice(2).split(""); // Removes the two first digits and turns fetched duration into string
    durationArray = durationArray.map(value => Number(value) || value) // turns string digits to int

    let time = ""
    let parsedDuration = ""
    durationArray.forEach(element => {
        if (typeof element == "number"){
            time += element

        } else {
            parsedDuration += ('0' + time).slice(-2) // Adds zero before number if number is single digit
            parsedDuration += ":"

            time = ""    
        }
    })

    return parsedDuration.slice(0, -1) // Slice will remore last ":" from string
}

function getDetails(channelTitle, date, duration, viewCount){
    let details = document.createElement("div");

    var channel = document.createElement("p");
    channel.innerText = 'Channel: ' + channelTitle;
    details.appendChild(channel);

    var videoDuration = document.createElement("p");
    duration = getParsedDuration(duration);
    videoDuration.innerText = 'Duration: ' + duration;
    details.appendChild(videoDuration);

    var publishDate = document.createElement("p");
    publishDate.innerText = 'Published: ' + date;
    details.appendChild(publishDate);

    var views = document.createElement("p");
    views.innerText = 'Views: ' + Number(viewCount).toLocaleString(); //toLocaleString adds dots to number for better a format
    details.appendChild(views);

    return details
}

function getStats(likeCount, dislikeCount){
    var stats = document.createElement("div");
    stats.classList.add("stats");

    var likes = document.createElement("p");
    likes.classList.add("likes");

    var dislikes = document.createElement("p");
    dislikes.classList.add("dislikes");

    //toLocaleString adds dots to number for better a format
    likes.innerText = '👍' + Number(likeCount).toLocaleString();
    dislikes.innerText = '👎' + Number(dislikeCount).toLocaleString();

    stats.appendChild(likes);
    stats.appendChild(dislikes);

    return stats
}

function createPopup(element, title, details, stats) {
    var elementRect = element.getBoundingClientRect();

    var popup = document.createElement("div");
    document.documentElement.appendChild(popup); 
    popup.classList.add("popup");

    var videoTitle = document.createElement("h3");
    videoTitle.innerText = title;
    videoTitle.classList.add("videoTitle");

    popup.appendChild(videoTitle);
    popup.appendChild(details);
    popup.appendChild(stats);
    
    // Gets link coordinates to place the popup near it.
    // Window.scrollY is needed here since elementRect returns the value in relation to the viewport instead of whole page.
    var popupTop  = (elementRect.top + window.scrollY + 40);   
    var popupLeft = (elementRect.left + (elementRect.width/2));
    popup.style.top  = popupTop + 'px';
    popup.style.left = popupLeft + 'px';

    // These will prevent the popup window from going outside the page.
    if (popup.getBoundingClientRect().left < 0) {
        popupLeft += ((popup.offsetWidth/2) - (elementRect.width/2));
        popup.style.left = popupLeft + 'px'; 
    }

    if (popup.getBoundingClientRect().right > document.body.offsetWidth) {
        popupLeft -= popup.getBoundingClientRect().right - document.body.offsetWidth;
        popup.style.left = popupLeft + 'px'; 
    }

    document.body.addEventListener('mouseout', (e) => {
        popup.remove()
    }, false);
}

async function getData(id, element) {
    // Fetches data from API.

    try {
        let secrets = await fetch(chrome.extension.getURL('/secrets.json')).then(Response => {return Response.json()});
        let url = 'https://youtube.googleapis.com/youtube/v3/videos?part=snippet&part=contentDetails&part=statistics&id=' + id + '&key=' + secrets["API"]
        const data = await fetch(url).then(Response => {return Response.json()});

        let snippet = data['items'][0]['snippet'];
        let statistics = data['items'][0]['statistics']
        
        let date = snippet['publishedAt'];
        date = date.substring(0, 10);
        let title = snippet['title'];
        let channelTitle = snippet['channelTitle'];
        let duration = data['items'][0]['contentDetails']['duration'];
        let viewCount = statistics['viewCount'];
        let likeCount = statistics['likeCount'];
        let dislikeCount = statistics['dislikeCount'];

        let details = getDetails(channelTitle, date, duration, viewCount);
        let stats = getStats(likeCount, dislikeCount);

        createPopup(element, title, details, stats);

    } catch(e) {console.log(e)}
}

function getDataHandler(event) {
    var target = event.target
    if (target && target.tagName == 'A') {
        var href = target.getAttribute('href');

        // Covers the main situations that a link can be found in the page (Hopefully).
        var videoID = href.replace("https://", "")
                        .replace("http://", "")
                        .replace("www.", "")
                        .replace("youtube.com/", "")
                        .replace("youtu.be/", "")
                        .replace("/watch?v=", "")
                        .replace("watch?v=", "");

        getData(videoID, target);   
    }
}

document.body.addEventListener('mouseover', getDataHandler, true);

chrome.runtime.onMessage.addListener((message) => {
    if (message.status) {
        document.body.removeEventListener('mouseover', getDataHandler, true);
    }
});