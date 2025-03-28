async function fetchImg() {
    try {
        const res = await fetch("https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature")
        if(!res.ok) {
            throw new Error("Can't fetch Image from the API at this time")
        }
        const data = await res.json()
        const imgData = {
            "dateTime": Date.now(),
            "authorPage": data.user.links.portfolio,
            "authorName": data.user.name,
            "img": data.urls.regular
        }
        localStorage.setItem('lastStoredImg', JSON.stringify(imgData))
        displayBackground(imgData)
    } catch (err) {
        document.body.style.backgroundImage = `url(https://images.unsplash.com/photo-1560008511-11c63416e52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyMTEwMjl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2MjI4NDIxMTc&ixlib=rb-1.2.1&q=80&w=1080
        )`
        document.getElementById("author").textContent = `By: Dodi Achmad`
    }  
}

try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin")
    if (!res.ok) {
        throw Error("Something went wrong")
    }
    const data = await res.json()
    document.getElementById("crypto-top").innerHTML = `
        <img src=${data.image.small} />
        <span>${data.name}</span>
    `
    document.getElementById("crypto").innerHTML += `
        <p>🎯: $${data.market_data.current_price.usd}</p>
        <p>👆: $${data.market_data.high_24h.usd}</p>
        <p>👇: $${data.market_data.low_24h.usd}</p>
    `
} catch (err) {
    console.error(err)
}

// Setting time clock

function getCurrentTime() {
    const date = new Date()
    document.getElementById("time").textContent = date.toLocaleTimeString("en-us", { timeStyle: "short" })
}

setInterval(getCurrentTime, 1000)

// Fetching weather

navigator.geolocation.getCurrentPosition(async position => {
    try {
        const res = await fetch(`https://apis.scrimba.com/openweathermap/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric`)
        if (!res.ok) {
            throw Error("Weather data not available")
        }
        const data = await res.json()
        const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        document.getElementById("weather").innerHTML = `
            <img src=${iconUrl} />
            <p class="weather-temp">${Math.round(data.main.temp)}º</p>
            <p class="weather-city">${data.name}</p>
        `
    } catch (err) {
        console.error(err)
    }
});

// Displaying the background

const localData = JSON.parse(localStorage.getItem('lastStoredImg'))

document.getElementById("author").addEventListener("click", () => {
    window.location.assign(localData.authorPage)
})

function shouldFetchImg() {
    
    if(!localData){
        return true
    }
    
    const newDate = Date.now()
    const timeDiff = newDate - localData.dateTime 
    
    if(timeDiff >= 86400000){
        return true
    }else {
        return false
    }
}

function displayBackground(data) {
    let {img, authorPage, authorName} = data
    document.body.style.backgroundImage = `url(${img})`
    document.getElementById("read-author").textContent = `${authorName}`
    authorPage= authorPage
}


if(shouldFetchImg()) {
    fetchImg()
} else {
    displayBackground(localData)
}

// all tabs 

const tabsBtn = document.getElementById("opened-tabs-title")

const allTabsBtn = document.getElementById("opened-tabs-btn")

let allTabs = []
let showAllTabs = false

chrome.storage.local.get('openTabs', (result) => {
    if(result.openTabs) {
        console.log(result.openTabs)
        allTabs = result.openTabs
    }
})

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.openTabs) {
        allTabs = changes.openTabs.newValue
        console.log(allTabs)    
        handleAllTabs()
    }
});

function handleAllTabs() {
    const favTabsIds = JSON.parse(localStorage.getItem("favTabs")) ?
        JSON.parse(localStorage.getItem("favTabs")).map(tab => tab.id) 
        :
        null 
    console.log(favTabsIds)  
    document.getElementById("opened-tabs-list").innerHTML = ''
    allTabs.forEach(obj => {
        const {id, url, favIconUrl, title} = obj
        let emoji 
        if(favTabsIds) {
            favTabsIds.find(x => x === id) ?
                emoji = "✅"
                :
                emoji = "➕"
        }else {
            emoji = "➕"    
        }
        document.getElementById("opened-tabs-list").innerHTML += `
            <div class="tab" id="${id}">
                <img src="${favIconUrl}" alt="${title}" class="tab-icon"/>
                <a href="${url}" class="tab-url">${url.slice(0, 15)}...</a>
                <p class="add-fav" id="${id}">${emoji}</p>
            </div>
        `
    });
}

allTabsBtn.addEventListener("click", (e) => {
    let existingLocalStorage = localStorage.getItem("favTabs") 
    if(e.target.closest(".add-fav")) {
        const favId = e.target.closest(".add-fav").id
        const favTab = allTabs.filter(tab => tab.id == favId)[0]
        existingLocalStorage ? 
            existingLocalStorage = JSON.parse(existingLocalStorage) 
            : 
            existingLocalStorage = []
        if(existingLocalStorage.find(tab => tab.id == favId)){
            alert("This Tab is already saved in your localStorage")
        }else {
            existingLocalStorage.unshift(favTab)
        }
        localStorage.setItem("favTabs", JSON.stringify(existingLocalStorage))
        e.target.closest(".add-fav").textContent = "✅"
        console.log("Updated favTabs in the localStorage")
    }else {
        if(!showAllTabs){
            showAllTabs = true
            tabsBtn.innerText = "Hide all tabs"
            handleAllTabs() 
            document.getElementById("opened-tabs-list").classList.remove("disabled")
        }else {
            showAllTabs = false
            tabsBtn.innerText = "See all tabs"
            document.getElementById("opened-tabs-list").classList.add("disabled")
        }
    }
    
})
