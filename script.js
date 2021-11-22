function getMeanings(data) {
    meanings = data[0].meanings
    var div = document.createElement("div");

    meanings.forEach(meaning => {
        var block = document.createElement("div");
        var line = document.createElement('hr');
        line.style.opacity = "0.7";

        var partOfSpeech = document.createElement("p");
        var definition = document.createElement("p");
        var example = document.createElement("p");

        partOfSpeech.innerText = meaning.partOfSpeech;
        definition.innerText = meaning.definitions[0].definition;
        example.innerText = '"' + meaning.definitions[0].example + '"';
        
        partOfSpeech.style.cssText = `
            margin-top: 16px;
            margin-bottom: 0px;
            font-size: smaller;
            font-style: italic;
            opacity: 0.8;
        `;
        definition.style.cssText = `
            margin-top: 16px;
            margin-left: 6px;
        `;
        example.style.cssText = `
            display: list-item;
            list-style-type: square;
            list-style-position: outside;
            margin-left: 24px;
            opacity: 0.7;
        `;

        block.appendChild(line);
        block.appendChild(partOfSpeech);
        block.appendChild(definition);
        block.appendChild(example);
        
        div.appendChild(block);
    
    });

    return div
}

function createPopup(data) {
    var selection = window.getSelection();
    var selectionRect = selection.getRangeAt(0).getBoundingClientRect();

    // var popup = document.createElement("div");
    // document.documentElement.appendChild(popup); 

    // var word           = document.createElement("h3");
    // word.innerText     = selection.toString();
    // word.style.cssText = `
    //     margin: 8px;
    //     font-weight: bold;
    // `;
    // popup.appendChild(word);

    // var meanings = getMeanings(data);
    // popup.appendChild(meanings);

    // Gets word selection coordinates to place the popup near it.
    // var popupTop = (selectionRect.top + window.scrollY + 40);   // Window.scrollY is needed here since selectionRect returns the value in relation to the viewport instead of whole page.
    // var popupLeft = (selectionRect.left + (selectionRect.width/2));
    
    // popup.style.cssText = `
    //     position: absolute;
    //     width: 400px;
    //     padding: 16px;
    //     background: #342b49;
    //     color: white;
    //     border: solid;
    //     border-radius: 8px;
    //     z-index: 9999;

    //     transform: translateX(-50%);
    // `;
    // popup.style.top     = popupTop + 'px';
    // popup.style.left    = popupLeft + 'px';
    // if (popup.getBoundingClientRect().left < 0) {
    //     // This will prevent the popup window from going outside the page.
    //     popupLeft += ((popup.offsetWidth/2) - (selectionRect.width/2))
    //     popup.style.left = popupLeft + 'px'; 
    // }

    document.body.addEventListener('click', (e) => {
        popup.remove()
    }, false);
}

async function getData(id, element) {
    // Fetches data from API.
    var apiKey = 'AIzaSyCYGkbbeTBJKYeJ2SMx9-AT6No1CbvBcDA'

    try {
        const data = await fetch('https://youtube.googleapis.com/youtube/v3/videos?part=snippet&part=contentDetails&part=statistics&id=' + id + '&key=' + apiKey).then(Response => {return Response.json()});

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

        console.log(title);
        console.log(date);
        console.log(duration);
        console.log(viewCount);
        console.log(likeCount);
        console.log(dislikeCount);
        console.log(channelTitle);

    } catch(e) {console.log(e)}
}

function getDataHandler(event) {
    var target = event.target.parentElement
    if (target && target.tagName == 'A') {
        var href = target.getAttribute('href');

        var videoID = href.replace("/watch?v=", "")

        console.log(videoID);
        console.log(target);
        getData(videoID, target);
    }
}

document.body.addEventListener('mouseover', getDataHandler, true);

chrome.runtime.onMessage.addListener((message) => {
    if (message.status) {
        document.body.removeEventListener('mouseover', getDataHandler, true);
    }
});
