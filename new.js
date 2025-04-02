const UNSPLASH_ACCESS_KEY = '8-YYpB5A5AxaDW6zoMmOp-BaB5LmxMDbslDXoNBM9ek'; // Replace with your actual access key
const UNSPLASH_API_URL = 'https://api.unsplash.com/photos/random?query=science,space&client_id=' + UNSPLASH_ACCESS_KEY;

const searchInput = document.querySelector('.search-input');
const searchSuggestions = document.querySelector('.search-suggestions');
const searchButton = document.querySelector('.search-container .search-icon');

document.body.addEventListener("click", (e) => {
    const SearchEl = ["search-container", "search-icon", "search-area", "fa-solid", "search-suggestions", "search-input", "suggestion"];
    if (e.target.classList[0] !== SearchEl[0] && e.target.classList[0] != SearchEl[1] && e.target.classList[0] != SearchEl[2] && e.target.classList[0] != SearchEl[3] && e.target.classList[0] != SearchEl[4] && e.target.classList[0] != SearchEl[5] && e.target.classList[0] != SearchEl[6]) {
        searchSuggestions.classList.add('hide');
        searchInput.value = '';
    }
    // console.log(e.target)
})

function setBackgroundImage(imageUrl) {
    document.body.style.backgroundImage = `url(${imageUrl})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
}


async function fetchAndSetBackgroundImage() {
    try {
        const response = await fetch(UNSPLASH_API_URL);
        const data = await response.json();
        const imageUrl = data.urls.full;
        setBackgroundImage(imageUrl);

        // Store the image URL and timestamp in local storage
        localStorage.setItem('backgroundImage', imageUrl);
        localStorage.setItem('backgroundImageTimestamp', Date.now());
        localStorage.setItem('imageAuthor', data.user.name);
        localStorage.setItem('authorPortfolio', data.user.links.html);
        } catch (error) {
        console.error('Error fetching image from Unsplash:', error);
    }
}


function initializeBackgroundImage() {
    const storedImage = localStorage.getItem('backgroundImage');
    const storedTimestamp = localStorage.getItem('backgroundImageTimestamp');
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (storedImage && storedTimestamp && (Date.now() - storedTimestamp < oneDay)) {
        // Use the stored image if it's less than 24 hours old
        setBackgroundImage(storedImage);
    } else {
        // Fetch a new image if no valid stored image exists
        fetchAndSetBackgroundImage();
    }
}

// Initialize the background image when the page loads
initializeBackgroundImage();


function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    const timeElement = document.querySelector('.center');
    if (timeElement) {
        timeElement.textContent = formattedTime;
    }
}

// Update the time every second
setInterval(updateTime, 1000);

// Initialize the time display
updateTime();

async function fetchWeather() {
    try {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const WEATHER_API_KEY = 'e916fb5389651a12b8147555fa7b7ea0';
            const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`;

            const response = await fetch(WEATHER_API_URL);
            const data = await response.json();

            const temperature = Math.round(data.main.temp);
            const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            // const weatherDescription = data.weather[0].description;
            const cityName = data.name;

            const weatherElement = document.querySelector('.weather-container');
            if (weatherElement) {
                document.querySelector('.weather-icon').src = weatherIcon;
                document.querySelector('.temperature').textContent = `${temperature}°C`;
                document.querySelector('.weather-city').textContent = cityName   
            }
        }, (error) => {
            console.error('Error getting location:', error);
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Update the weather every 1 hour
setInterval(fetchWeather, 60 * 60 * 1000);

// Fetch and display the weather when the page loads
fetchWeather();

function initializeSearchFunctionality() {

    if (!searchInput || !searchSuggestions || !searchButton) {
        console.error('Search elements not found in the DOM.');
        return;
    }

    searchInput.addEventListener('input', async (event) => {

        searchSuggestions.classList.remove('hide');
        const query = event.target.value.trim();

        // console.log(query)
        if (query.length === 0) {
            searchSuggestions.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`);
            const suggestions = await response.json();

            searchSuggestions.innerHTML = suggestions[1]
                .map(suggestion => `<p class="suggestion">${suggestion}</p>`)
                .join('');

            searchSuggestions.querySelectorAll('p').forEach(item => {
                item.addEventListener('click', () => {
                    searchInput.value = item.textContent;
                    searchSuggestions.innerHTML = '';
                    searchSuggestions.classList.toggle('hide');
                });
            });
        } catch (error) {
            console.error('Error fetching search suggestions:', error);
        }
    });

    let searchFunction = () => {
        const query = searchInput.value.trim();
        if (query) {
            // console.log("url:", encodeURIComponent(query))
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
            searchInput.value = '';
        }
    };

    searchButton.addEventListener('mouseenter', searchFunction);

    searchButton.addEventListener('click', searchFunction);

}

// Initialize the search functionality when the page loads
initializeSearchFunctionality();

function populateAllTabs() {
    const allTabsToggle = document.querySelector('.all-tabs-toggle');
    const allTabsList = document.querySelector('.all-tabs-list');

    
    if (!allTabsToggle || !allTabsList) {
        console.error('Tab elements not found in the DOM.');
        return;
    }
    
    const updateAllTabsList = async () => {
        // let favTabsStored = localStorage.getItem('favTabs') || [];
        try {
            const tabs = await chrome.tabs.query({});
            const isMobileView = window.innerWidth < 780;

            allTabsList.innerHTML = tabs
                .filter(tab => tab.title !== "Alien Dashboard") // Exclude the current tab
                .map(tab => {
                    const bookedColor = 'green';
                    const bookedTab = localStorage.getItem("favTabs") && JSON.parse(localStorage.getItem("favTabs")).some(favTab => favTab.id === tab.id)
                    const truncatedTitle = tab.title.slice(0, isMobileView ? 10 : 25) + (tab.title.length > (isMobileView ? 10 : 25) ? '...' : '');
                    const truncatedUrl = tab.url.slice(0, isMobileView ? 13 : 26) + (tab.url.length > (isMobileView ? 13 : 26) ? '...' : '');

                    return `
                        <div class="tab-item" data-tab-id="${tab.id}">
                            <img src="${tab.favIconUrl || ''}" alt="${tab.title}" class="tab-icon">
                            <div class="tab-info">
                                <div class="tab-title">${truncatedTitle}</div>
                                <div class="tab-url">${truncatedUrl}</div>
                            </div>
                            <div class="add-tab-to-bookmark" data-tab-id="${tab.id}">
                                <i class="fa-solid fa-bookmark" style="color: ${bookedTab ? bookedColor : 'inherit'};"></i>
                            </div>
                            <div class="tab-close" data-tab-id="${tab.id}">✕</div>
                        </div>
                    `;
                })
                .join('');

            allTabsList.querySelectorAll('.tab-close').forEach(closeButton => {
                closeButton.addEventListener('click', event => {
                    event.stopPropagation();
                    const tabId = parseInt(closeButton.dataset.tabId, 10);
                    chrome.tabs.remove(tabId);
                });
            });

            allTabsList.querySelectorAll('.tab-item').forEach(tabItem => {
                tabItem.addEventListener('click', (e) => {
                    if(!e.target.classList.contains('fa-bookmark')){
                        const tabId = parseInt(tabItem.dataset.tabId, 10);
                        chrome.tabs.update(tabId, { active: true });
                    }
                });
            });
        } catch (error) {
            console.error('Error updating tabs list:', error);
        }
    };

    document.addEventListener("click", async (e) => {
        const target = e.target.closest('.add-tab-to-bookmark');
        if (target) {
            e.stopPropagation(); // Stop the event from propagating further
            e.preventDefault();
            const tabId = parseInt(target.dataset.tabId, 10);
            let favTabsStored = localStorage.getItem('favTabs') ? JSON.parse(localStorage.getItem('favTabs')) : [];

            if (favTabsStored.some(favTab => favTab.id === tabId)) {
                favTabsStored = favTabsStored.filter(favTab => favTab.id !== tabId);
                target.querySelector('i').style.color = 'inherit';
            } else {
                const tab = await chrome.tabs.get(tabId);
                favTabsStored.push({ id: tabId, title: tab.title, url: tab.url, icon: tab.favIconUrl });
                target.querySelector('i').style.color = 'green';
            }

            localStorage.setItem('favTabs', JSON.stringify(favTabsStored));
            updateAllTabsList();
        }
    })

    allTabsToggle.addEventListener('click', () => {
        allTabsList.classList.toggle('hide');
        if (!allTabsList.classList.contains('hide')) {
            allTabsToggle.querySelector('.tab-status').innerHTML =   '<i class="fa-solid fa-square-xmark"></i>'
            // console.log(allTabsToggle.querySelector('.tab-status'))
            updateAllTabsList();
        }else {
            allTabsToggle.querySelector('.tab-status').innerHTML =   '<i class="fa-solid fa-caret-down"></i>'
        }
    });

    window.addEventListener('resize', () => {
        if (!allTabsList.classList.contains('hide')) {
            updateAllTabsList();
        }
    });

    const tabEvents = ['onActivated', 'onMoved', 'onCreated', 'onRemoved', 'onUpdated'];
    tabEvents.forEach(event => chrome.tabs[event].addListener(updateAllTabsList));
}

// Initialize the tab functionality when the page loads
populateAllTabs();

// localStorage.removeItem('favTabs')

function populateFavTabs() {
    const favTabsList = document.querySelector('.fav-tabs-list');
    const favTabsStored = localStorage.getItem('favTabs') ? JSON.parse(localStorage.getItem('favTabs')) : [];

    if (!favTabsList) {
        console.error('Fav tabs list element not found in the DOM.');
        return;
    }

    favTabsList.innerHTML = favTabsStored
        .map(favTab => {
            return `
                <div class="fav-tab-item" data-tab-id="${favTab.id}">
                    <img src="${favTab.icon}" alt="${favTab.title}" class="tab-icon">
                    <div class="tab-info">
                        <div class="tab-title">${favTab.title}</div>
                        <div class="tab-url">${favTab.url}</div>
                    </div>
                </div>
            `;
        })
        .join('');

    favTabsList.querySelectorAll('.fav-tab-item').forEach(favTabItem => {
        favTabItem.addEventListener('click', (e) => {
            const tabId = parseInt(favTabItem.dataset.tabId, 10);
            chrome.tabs.update(tabId, { active: true });
        });
    });
}

populateFavTabs()
