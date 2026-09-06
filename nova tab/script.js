const NASA_API_KEY = "Lp5jiLVBrcmVJ751WeohFmEsMpj798qILpIWPkVe";

const defaultLinks = [
    { name: "GitHub", url: "https://github.com", icon: "GH" },
    { name: "YouTube", url: "https://youtube.com", icon: "YT" },
    { name: "Hack Club", url: "https://hackclub.com", icon: "HC" },
    { name: "NASA", url: "https://www.nasa.gov/", icon: "N" }
];

const clock = document.getElementById("clock");
const date = document.getElementById("date");
const greeting = document.getElementById("greeting");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

const themeButton = document.getElementById("themeButton");
const linksGrid = document.getElementById("linksGrid");
const editLinksButton = document.getElementById("editLinksButton");
const linksDialog = document.getElementById("linksDialog");
const linksForm = document.getElementById("linksForm");
const linkFields = document.getElementById("linkFields");

/* =========================
   CLOCK & GREETING
========================= */

function updateTime() {
    const now = new Date();

    if (clock) {
        clock.textContent = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    }

    if (date) {
        date.textContent = now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });
    }

    if (greeting) {
        const hour = now.getHours();
        if (hour < 12) {
            greeting.textContent = "Good morning.";
        } else if (hour < 18) {
            greeting.textContent = "Good afternoon.";
        } else {
            greeting.textContent = "Good evening.";
        }
    }
}

updateTime();
setInterval(updateTime, 1000);

/* =========================
   SEARCH
========================= */

if (searchForm) {
    searchForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const query = searchInput.value.trim();

        if (!query) {
            searchInput.focus();
            return;
        }

        window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(query);
    });
}

/* =========================
   QUICK LINKS
========================= */

function getLinks() {
    const saved = localStorage.getItem("stardust-links");

    if (!saved) {
        return defaultLinks;
    }

    try {
        const links = JSON.parse(saved);
        if (Array.isArray(links) && links.length > 0) {
            return links;
        }
    } catch {
        console.log("Could not load saved links from storage.");
    }

    return defaultLinks;
}

function saveLinks(links) {
    localStorage.setItem("stardust-links", JSON.stringify(links));
}

function renderLinks() {
    if (!linksGrid) return;
    
    const links = getLinks();
    linksGrid.innerHTML = "";

    links.forEach(function(link) {
        const card = document.createElement("a");
        card.className = "link-card";
        card.href = link.url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";

        const icon = document.createElement("span");
        icon.className = "link-icon";
        icon.textContent = link.icon || "•";

        const information = document.createElement("span");

        const name = document.createElement("span");
        name.className = "link-name";
        name.textContent = link.name;

        const url = document.createElement("span");
        url.className = "link-url";

        try {
            url.textContent = new URL(link.url).hostname;
        } catch {
            url.textContent = link.url;
        }

        information.appendChild(name);
        information.appendChild(url);
        card.appendChild(icon);
        card.appendChild(information);
        linksGrid.appendChild(card);
    });
}

renderLinks();

/* =========================
   DARK MODE
========================= */

function loadTheme() {
    const theme = localStorage.getItem("stardust-theme");

    if (theme === "dark") {
        document.body.classList.add("dark");
        if (themeButton) themeButton.textContent = "☾";
    } else {
        if (themeButton) themeButton.textContent = "☼";
    }
}

if (themeButton) {
    themeButton.addEventListener("click", function() {
        document.body.classList.toggle("dark");
        const dark = document.body.classList.contains("dark");
        localStorage.setItem("stardust-theme", dark ? "dark" : "light");
        themeButton.textContent = dark ? "☾" : "☼";
    });
}

loadTheme();

/* =========================
   EDIT & SAVE LINKS DIALOG
========================= */

if (editLinksButton) {
    editLinksButton.addEventListener("click", openEditor);
}

function openEditor() {
    const links = getLinks();
    linkFields.innerHTML = "";

    links.forEach(function(link, index) {
        const wrapper = document.createElement("div");
        wrapper.className = "link-field";

        const nameInput = document.createElement("input");
        nameInput.name = "name-" + index;
        nameInput.value = link.name;
        nameInput.placeholder = "Name";

        const urlInput = document.createElement("input");
        urlInput.name = "url-" + index;
        urlInput.value = link.url;
        urlInput.placeholder = "https://example.com";

        wrapper.appendChild(nameInput);
        wrapper.appendChild(urlInput);
        linkFields.appendChild(wrapper);
    });

    if (linksDialog) linksDialog.showModal();
}

if (linksForm) {
    linksForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const oldLinks = getLinks();

        const newLinks = oldLinks.map(function(link, index) {
            const nameInput = linksForm.elements["name-" + index];
            const urlInput = linksForm.elements["url-" + index];

            const name = nameInput ? nameInput.value.trim() : link.name;
            const url = urlInput ? urlInput.value.trim() : link.url;

            return {
                name: name || link.name,
                url: normalizeURL(url || link.url),
                icon: (name || link.name).substring(0, 2).toUpperCase()
            };
        });

        saveLinks(newLinks);
        renderLinks();
        if (linksDialog) linksDialog.close();
    });
}

function normalizeURL(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return "https://" + url;
    }
    return url;
}

/* =========================
   NASA APOD LOADER
========================= */

async function loadNASA() {
    const image = document.getElementById("apodImage");
    const title = document.getElementById("apodTitle");
    const apodDate = document.getElementById("apodDate");
    const explanation = document.getElementById("apodExplanation");
    const link = document.getElementById("apodLink");
    const loading = document.getElementById("apodLoading");

    function displayImage(imageUrl) {
        if (!image) return;
        image.src = imageUrl;
        image.onload = function() {
            if (loading) loading.style.display = "none";
            image.style.display = "block";
        };
        image.onerror = function() {
            if (loading) loading.textContent = "Unable to load image preview.";
        };
    }

    try {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`);

        if (!response.ok) {
            throw new Error(`NASA API HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (title) title.textContent = data.title || "Astronomy Picture of the Day";
        if (apodDate) apodDate.textContent = data.date ? formatNASAdate(data.date) : "--";
        if (explanation) explanation.textContent = data.explanation || "No description available.";
        if (link) link.href = data.hdurl || data.url || "#";

        if (data.media_type === "image") {
            displayImage(data.hdurl || data.url);
        } else if (data.media_type === "video") {
            if (loading) loading.textContent = "Today's APOD is a video. Click below to view on NASA.";
            if (link) link.href = data.url;
        } else {
            displayImage(data.url);
        }
    } catch (error) {
        console.warn("NASA API call failed, activating backup space preview.", error);
        
        if (title) title.textContent = "Carina Nebula in High Detail";
        if (apodDate) apodDate.textContent = "Featured Space Snapshot";
        if (explanation) explanation.textContent = "A star-forming region in the Carina Nebula, capturing massive stars emerging amidst cosmic gas and dust clouds.";
        if (link) link.href = "https://www.nasa.gov/";
        
        displayImage("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop");
    }
}

function formatNASAdate(value) {
    const d = new Date(value + "T00:00:00");
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

loadNASA();