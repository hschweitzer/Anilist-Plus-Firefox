/*
*
* CONTENT SCRIPT
*
*/

'use strict'

function showStudioLink(navBar, vuedata) {
    navBar.insertAdjacentHTML(
        'beforeend', 
        `<a ${vuedata} id="studio_link" style="cursor: pointer;" class="link">Studios</a>`
    )
}

var observer = new MutationObserver(async function() {
    let navBar = document.querySelector('.content>.nav')
    let url = window.location.href
    let studioLink = document.getElementById('studio_link')

    if(navBar && !studioLink && (url.includes('/anime/'))) { 
        
        let vuedata = navBar.firstElementChild.attributes[0].name
        showStudioLink(navBar, vuedata)
        studioLink = document.getElementById('studio_link')

        let res = await mediaTitle(mediaId())
        let studioList = res.data.Media.studios.nodes

        studioLink.addEventListener('click', () => {

            if (window.location.href.split('/').length !== 5) {
                var oldLink = document.querySelector('.router-link-exact-active.router-link-active')
                oldLink.classList.add('old-container-active')
                oldLink.classList.remove('router-link-exact-active', 'router-link-active')
            } else {
                navBar.firstChild.classList.add('old-container-active')
            }

            studioLink.classList.add('router-link-exact-active', 'router-link-active')
            let contentContainer = document.querySelector('.content.container')
            let oldContainer = contentContainer.lastChild
            oldContainer.style.display = 'none'
            let studiosElement = createStudiosElement(studioList)
            contentContainer.appendChild(studiosElement)

            navBar.addEventListener('click', (e) => {
                e = window.event? event.srcElement: e.target
                if(e.id !== "studio_link") {
                    studiosElement.remove()
                    if(e.className && e.className.indexOf('old-container-active') != -1) {
                        oldContainer.style.display = 'block'
                    }                    
                    studioLink.classList.remove('router-link-exact-active', 'router-link-active')
                } 
            })
        })
    }
})

const mediaTitle = async (a) => {
    const query = {
        "query": `
            query ($id: Int) {
                Media (id: $id, type: ANIME) {
                    id
                    studios {
                        nodes {
                            name
                            media(sort: POPULARITY_DESC) {
                                nodes {
                                    id
                                    title {
                                        userPreferred
                                    }
                                    coverImage {
                                        medium
                                    }
                                    startDate {
                                        year
                                        month
                                        day
                                    }
                                    season
                                    description
                                    type
                                    format
                                    genres
                                    isAdult
                                    averageScore
                                    popularity
                                    mediaListEntry {
                                        status
                                    }
                                    status
                                    nextAiringEpisode {
                                        airingAt
                                        timeUntilAiring
                                        episode
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `,
        "variables" : {
            "id": a
        }
    }

    let data = null
    let errors = null

    try {
        const data = await sendAniListQuery(query)
        console.log(a)
    } catch(e) {
        console.log("Request error", e)
    }

    return data
}

function mediaId() {
    let url = window.location.href
    return url.split('/')[4]
}

function createStudiosElement(studioList) {
    let studiosElement = document.createElement('div')
    studiosElement.id = "studios"
    
    for (var i = 0; i < studioList.length; i++) {
        const mediaList = studioList[i].media.nodes
        let studio = document.createElement('div')
        let studioName = document.createElement('h2')
        studioName.innerText = studioList[i].name
        studio.appendChild(studioName)
        for (var j = 0; j < mediaList.length; j++) {
            let mediaElement = document.createElement('div')
            mediaElement.classList.add("media-preview-card", "small")
            mediaElement.setAttribute("data-v-711636d7", "")
            mediaElement.setAttribute("data-v-9c15f6ba", "")
            const mediaLink = "/anime/" + mediaList[j].id
            const mediaCover = mediaList[j].coverImage.medium
            const mediaTitle = mediaList[j].title.userPreferred
            const mediaFormat = mediaList[j].format
            const mediaStatus = mediaList[j].status
            const mediaScore = mediaList[j].averageScore
            const mediaYear = mediaList[j].startDate.year
            const mediaString =
            `<a data-v-711636d7="" href="${mediaLink}" class="cover" data-src="${mediaCover}" lazy="loaded" style="background-image: url(&quot;${mediaCover}&quot;);">
                <div data-v-711636d7="" class="image-text">
                    <div data-v-9c15f6ba="">${mediaYear} · ${mediaScore}</div>
                </div> <!---->
            </a>
            <div data-v-711636d7="" class="content">
                <div data-v-711636d7="" class="info-header">
                    <!-- <div data-v-9c15f6ba="" data-v-711636d7="">Side Story</div> -->
                </div> 
                <a data-v-711636d7="" href="${mediaLink}" class="title">${mediaTitle}</a>
                <div data-v-711636d7="" class="info">
                ${mediaFormat} · ${mediaStatus}
                </div>
            </div>`
            mediaElement.id = "studio_" + i + "_media_" + j
            mediaElement.innerHTML = mediaString.trim()
            studio.appendChild(mediaElement)
        }
        studiosElement.appendChild(studio)
    }
    return studiosElement
}

observer.observe(document, { childList: true, subtree: true })

const sendAniListQuery = async (query) => {
    console.log("I'm in!")
	const url = "https://graphql.anilist.co";
	const urlOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
        },
        body: JSON.stringify({
            query: query
        })
	};
    
    await fetch(url, urlOptions).then(handleResponse)
                                .then(handleData)
                                .catch(handleError);

/*
	const retrieve = await fetch(url, urlOptions);
	const { data, errors } = await retrieve.json();
	console.log("retrieve", retrieve, data, errors);

	if (errors) {
		console.log("Unsuccessfully made query", errors);
	}

	return [data, errors];*/
};

function handleResponse(response) {
    console.log("handleResponse")
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}
​
function handleData(data) {
    return data
}
​
function handleError(error) {
    alert('Error, check console');
    console.error(error);
}
