"use strict"
let mapboxStyle = 'mapbox://styles/mapbox/satellite-streets-v12';
let globalLat = 0;
let globalLong = 0;
let globalZoom = 0;

let play = function(){document.getElementById("audio").play()}

loadWeatherAndMap();

function loadWeatherAndMap () {
    callOpenWeather(29.63638, -98.40349);
    callMapBox(29.63638, -98.40349, 18);
}

function updateSearchBoxWeatherAndLocation () {
    geocode(addAddressSelection.value, MAPBOX_API_KEY).then(function(results) {
        console.log(results)
        callOpenWeather(results[1], results[0]);
        callMapBox(results[1], results[0], 18);
    })
}

function updateDragWeatherAndLocation (lat, lon) {
    callOpenWeather(lat, lon);
    callMapBox(lat, lon, 18);
}



function callOpenWeather (lat, lon) {
    $.get("http://api.openweathermap.org/data/2.5/forecast", {
        APPID: OPENWEATHER_API_KEY,
        lat:    lat,
        lon:   lon,
        units: "imperial"
    }).done(function(data) {
        console.log(data)
        document.getElementById("currentCity").innerHTML = 'Current city: ' + data.city.name;

        document.getElementById("tip1").innerHTML = renderWeatherTip(data, 0);
        document.getElementById("tip2").innerHTML = renderWeatherTip(data, 8);
        document.getElementById("tip3").innerHTML = renderWeatherTip(data,16);
        document.getElementById("tip4").innerHTML = renderWeatherTip(data,24);
        document.getElementById("tip5").innerHTML = renderWeatherTip(data,32);
        document.getElementById("tip6").innerHTML = renderWeatherTip(data,39);

        document.getElementById("card1").innerHTML = renderWeather(data, 0);
        document.getElementById("card2").innerHTML = renderWeather(data, 8);
        document.getElementById("card3").innerHTML = renderWeather(data,16);
        document.getElementById("card4").innerHTML = renderWeather(data,24);
        document.getElementById("card5").innerHTML = renderWeather(data,32);
        document.getElementById("card6").innerHTML = renderWeather(data,39);

        addSoundEffect(data)

        music.play();
     });

};



function callMapBox (lat, lon, zoom) {

    globalLat = lat;
    globalLong = lon;
    globalZoom = zoom

    mapboxgl.accessToken = MAPBOX_API_KEY;
    const map = new mapboxgl.Map({
        container: 'my-map',
        style: mapboxStyle,
        zoom: zoom,
        center: [lon, lat]
    });

    let marker = new mapboxgl.Marker({
        draggable: true
    })
        .setLngLat([lon, lat])
        .addTo(map);

    function onDragEnd() {
        const lngLat = marker.getLngLat();
        // coordinates.style.display = 'block';
        // coordinates.innerHTML = `Longitude: ${lngLat.lng}<br />Latitude: ${lngLat.lat}`;

        map.jumpTo({
            center: lngLat
        })

        updateDragWeatherAndLocation(lngLat.lat, lngLat.lng);
    }

    marker.on('dragend', onDragEnd)

    setPopup(marker, lon, lat)
};



function renderWeatherTip(data, increment) {

    let html = '<ul>';
    html += '<li>Feels Like: ' + Math.round(data.list[increment].main.feels_like) + String.fromCharCode(176) + 'F</li>';
    html += '<li>Humidity: ' + data.list[increment].main.humidity + '%</li>';
    html += '<li>Cloud Coverage: ' + Math.round(data.list[increment].clouds.all) + '%</li>';
    html += '<li>Wind Speed: ' + Math.round(data.list[increment].wind.speed) + '%</li>';
    html += '</ul>';
    html += '</span>';

    return html;
}



function renderWeather(data, increment) {

    let formattedDate = new Date((data.list[increment].dt * 1000))

    let html = '<div class="mx-auto card-header">' + formattedDate.toDateString() + '</div>';
    html += '<ul class="list-group list-group-flush">';
    html += '<li class="list-group-item"><img src="http://openweathermap.org/img/wn/' + data.list[increment].weather[0].icon + '@2x.png" style="width: 50px;"/></li>';
    html += '<li class="list-group-item">' + Math.round(data.list[increment].main.temp) + String.fromCharCode(176) + 'F ' + data.list[increment].weather[0].main + '</li>';
    html += '<li class="list-group-item">H: ' + Math.round(data.list[increment].main.temp_max) + String.fromCharCode(176) + 'F / L:' + Math.round(data.list[0].main.temp_min) + String.fromCharCode(176) + 'F</li><br>';
    html += '</ul>';

    return html;
};



function setPopup(marker, myLng, myLat) {
    reverseGeocode({lat: myLat, lng: myLng}, MAPBOX_API_KEY).then(function(results) {
        let popup = new mapboxgl.Popup()
            .setHTML(results)
        marker.setPopup(popup)
    })
};



function addSoundEffect(data) {
    if (data.list[0].weather[0].id >= 200 && data.list[0].weather[0].id <= 299){
        document.getElementById("music").src = "audio/Air-raid-siren-sound-effect.mp3";
    } else if (data.list[0].weather[0].id >= 300 && data.list[0].weather[0].id <= 399) {
        document.getElementById("music").src = "audio/Light-gentle-rain-sound.mp3";
    } else if (data.list[0].weather[0].id >= 500 && data.list[0].weather[0].id <= 599) {
        document.getElementById("music").src = "audio/Heavy-rain-sound-effect-loop.mp3";
    } else if (data.list[0].weather[0].id >= 600 && data.list[0].weather[0].id <= 699) {
        document.getElementById("music").src = "audio/Ice-sound-effect.mp3";
    } else if (data.list[0].weather[0].id >= 700 && data.list[0].weather[0].id <= 799) {
        document.getElementById("music").src = "audio/Air-raid-siren-sound-effect.mp3";
    } else if (data.list[0].weather[0].id === 800) {
        document.getElementById("music").src = "audio/birds chirping.mp3";
    } else if (data.list[0].weather[0].id >= 801 && data.list[0].weather[0].id <= 899) {
        document.getElementById("music").src = "audio/Wind-noise-sound-effect.mp3";
    } else {
        document.getElementById("music").src = "audio/bruh-sound-effect-1-6970.mp3";
    }
}



function changeMapboxStyle() {

    if (mapboxStyleSelection.value === "Mapbox Streets") {
        mapboxStyle = 'mapbox://styles/mapbox/streets-v12';
    } else if (mapboxStyleSelection.value === "Mapbox Outdoors") {
        mapboxStyle = 'mapbox://styles/mapbox/outdoors-v12';
    } else if (mapboxStyleSelection.value === "Mapbox Light") {
        mapboxStyle = 'mapbox://styles/mapbox/light-v11';
    } else if (mapboxStyleSelection.value === "Mapbox Dark") {
        mapboxStyle = 'mapbox://styles/mapbox/dark-v11';
    } else if (mapboxStyleSelection.value === "Mapbox Satellite") {
        mapboxStyle = 'mapbox://styles/mapbox/satellite-v9';
    } else if (mapboxStyleSelection.value === "Mapbox Navigation Day") {
        mapboxStyle = 'mapbox://styles/mapbox/navigation-day-v1';
    } else if (mapboxStyleSelection.value === "Mapbox Navigation Night") {
        mapboxStyle = 'mapbox://styles/mapbox/navigation-night-v1';
    } else {
        mapboxStyle = 'mapbox://styles/mapbox/satellite-streets-v12';
    }

    callMapBox(globalLat, globalLong, globalZoom);
}



const addAddressSelection = document.querySelector('#addAddress');
let submitAddress = document.getElementById("submitAddress");

submitAddress.addEventListener('click', updateSearchBoxWeatherAndLocation);

document.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        e.preventDefault()
        updateSearchBoxWeatherAndLocation();
    }
});


let mapboxStyleSelection = document.getElementById("mapboxStyle");
mapboxStyleSelection.addEventListener("change", changeMapboxStyle);

