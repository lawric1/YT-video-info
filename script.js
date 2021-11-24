function createPopup(element, title, channelTitle, date, duration, viewCount, likeCount, dislikeCount) {
    var elementRect = element.getBoundingClientRect();

    var popup = document.createElement("div");
    document.documentElement.appendChild(popup); 
    popup.classList.add("popup");

    var videoTitle = document.createElement("h3");
    videoTitle.innerText = title;
    videoTitle.classList.add("videoTitle");
    popup.appendChild(videoTitle);

    var channel = document.createElement("p");
    channel.innerText = 'Channel: ' + channelTitle;
    popup.appendChild(channel);

    var videoDuration = document.createElement("p");
    videoDuration.innerText = 'Duration: ' + duration;
    popup.appendChild(videoDuration);

    var publishDate = document.createElement("p");
    publishDate.innerText = 'Published: ' + date;
    popup.appendChild(publishDate);

    var views = document.createElement("p");
    views.innerText = 'Views: ' + viewCount;
    popup.appendChild(views);

    var feedback = document.createElement("div");
    feedback.classList.add("feedback");
    var likes = document.createElement("p");
    likes.classList.add("likes");
    var dislikes = document.createElement("p");
    dislikes.classList.add("dislikes");

    likes.innerText = '👍' + likeCount;
    dislikes.innerText = '👎' + dislikeCount;

    feedback.appendChild(likes);
    feedback.appendChild(dislikes);

    popup.appendChild(feedback);

    // var meanings = getMeanings(data);
    // popup.appendChild(meanings);

    // Gets word selection coordinates to place the popup near it.
    var popupTop = (elementRect.top + window.scrollY + 40);   // Window.scrollY is needed here since elementRect returns the value in relation to the viewport instead of whole page.
    var popupLeft = (elementRect.left + (elementRect.width/2));
    popup.style.top     = popupTop + 'px';
    popup.style.left    = popupLeft + 'px';
    if (popup.getBoundingClientRect().left < 0) {
        // This will prevent the popup window from going outside the page.
        popupLeft += ((popup.offsetWidth/2) - (elementRect.width/2));
        popup.style.left = popupLeft + 'px'; 
    }

    document.body.addEventListener('mouseout', (e) => {
        popup.remove()
    }, false);
}

async function getData(id, element) {
    // Fetches data from API.
    var secrets = await fetch(chrome.extension.getURL('/secrets.json')).then(Response => {return Response.json()});

    try {
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

        createPopup(element, title, channelTitle, date, duration, viewCount, likeCount, dislikeCount);

    } catch(e) {console.log(e)}
}

function getDataHandler(event) {
    var target = event.target
    if (target && target.tagName == 'A') {
        var href = target.getAttribute('href');
        var videoID = href.replace("/watch?v=", "")
        getData(videoID, target);    }
}

document.body.addEventListener('mouseover', getDataHandler, true);

chrome.runtime.onMessage.addListener((message) => {
    if (message.status) {
        document.body.removeEventListener('mouseover', getDataHandler, true);
    }
});
