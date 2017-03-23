

var map;
var response;
var stationResponse;
var middleStation;
var zipcode;
var coords;
var latitude;
var longitude;
var coordLat;
var coordLng;
var locationName = [];
var prev_InfoWindow = false;

function mapAdjust() {
    zipcode = document.getElementById('zip-code').value;
    loadLatLong(zipcode);
}

function loadLatLong(zipcode) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            response = JSON.parse(this.responseText);
            latitude = response.coord.lat;
            longitude = response.coord.lon;
            loadStations(latitude, longitude);
        }
    }
    xmlhttp.open("GET", "https://api.openweathermap.org/data/2.5/weather?zip=" + zipcode + ",us&appid=fab32103c7aba1797a0bd0441979c55c", true);
    xmlhttp.send();

}

function loadStations(latitude, longitude) {
    console.log('we are running loadStations: '+ latitude + longitude);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            middleStation = JSON.parse(this.responseText);
            console.log('this is the middle station : ' + middleStation);
            stationPoints(middleStation);
        }
    }
    xmlhttp.open("GET", "https://api.openweathermap.org/data/2.5/box/city?bbox=" +
        (longitude - 2) + "," + (latitude - 1) + "," + (longitude + 5) + "," +
        (latitude + 1) + "," + 8 + "&cluster=yes&appid=fab32103c7aba1797a0bd0441979c55c", true);
    xmlhttp.send();
}

function stationPoints(middleStation) {
  console.log('we are running station points: '+ middleStation);
    var map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(latitude, longitude),
        zoom: 7,
        mapTypeId: 'roadmap'
    });

    function infoPass(e, title) {
        infowindow = new google.maps.InfoWindow({
            content: "<div id='content'> <h1>" + e.title + "</h1> <p><b>Weather:</b> " +
                locationName[e.title].weather + "</br><b>Temperature: </b>" + locationName[e.title].temp + "</br><b>Humidity: </b>" + locationName[e.title].humidity + "</br><b>Pressure: </b>" + locationName[e.title].pressure + "</p>"
        });
        infowindow.open(map, e);
        prev_InfoWindow = infowindow
    }

    for (var i = 0; i < middleStation.list.length; i++) {
        let coordLat = middleStation.list[i].coord.Lat;
        let coordLng = middleStation.list[i].coord.Lon;
        locationName[middleStation.list[i].name] = {
            weather: middleStation.list[i].weather[0].description,
            temp: middleStation.list[i].main.temp,
            humidity: middleStation.list[i].main.humidity,
            pressure: middleStation.list[i].main.pressure
        };
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(coordLat, coordLng),
            map: map,
            title: middleStation.list[i].name,
            icon: 'https://openweathermap.org/img/w/' + middleStation.list[i].weather[0].icon + '.png'
        });

        marker.addListener('click', function() {
            if (prev_InfoWindow) {
                prev_InfoWindow.close();
                infoPass(this, this.title);
            } else {
                infoPass(this, this.title);
            }
        });
    }
    document.getElementById("geo-location-text").innerHTML = '';
    document.getElementById("loader").style.visibility = "hidden";

}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 39.828,
            lng: -98.579
        },
        zoom: 4,
        mapTypeId: 'roadmap'
    });
}

function useLocation() {
    document.getElementById("geo-location-text").innerHTML = 'Currently locating you...';
    document.getElementById("loader").style.visibility = "visible";
    document.getElementById("geo-location-box").style.animation = "textmove 2s ease-out forwards";
    if (navigator.geolocation.getCurrentPosition) {
        navigator.geolocation.getCurrentPosition(function(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            loadStations(latitude, longitude);
        });
        document.getElementById("geo-location-text").innerHTML = 'Geolocation active. Processing location...';

    } else {
        document.getElementById("geo-location-text").innerHTML = 'Your browser does not support geolocation...';
    }
}
