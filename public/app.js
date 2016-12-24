"use strict";
window.addEventListener('load', onWindowLoad);

function onWindowLoad () {
  console.log("Ready to rock !");

  var geoNamesUsername = "angelsalazar1992";
  // Endpoints
  var googleMapAPI   = 'https://maps.googleapis.com/maps/api/geocode/json?';
  var earthquakesAPI = 'http://api.geonames.org/earthquakesJSON?';

  var topTenEarthquakes = {
    north : 89.45016124669523,
    south : -87.71179927260242,
    east  : 180,
    west  : -180,
    date : new Date().toLocaleDateString().split('/').reverse().join('-'),
    minMagnitude : 7,
    username : geoNamesUsername
  };

  // Get widgets control
  var searchForm    = document.querySelector('#searchForm');
  var inputWrapper  = document.querySelector('#inputWrapper');
  var place         = document.querySelector('#place');
  var sortByDate    = document.querySelector('#time');
  var displayName   = document.querySelector('#display');
  var currentDate   = document.querySelector('#currentDate');
  var currentDate   = document.querySelector('#currentDate');
  var hint          = document.querySelector('#hint');
  var restore       = document.querySelector('#restore');
  var toggleMap     = document.querySelector('#toggleMap');
  var map           = document.querySelector('#map');
  var topTenTable   = document.querySelector('#topTenTable');
  var toggleMapCity = document.querySelector('#toggleMapCity');
  var mapForCity    = document.querySelector('#mapForCity');
  var earthquakeTable = document.querySelector('#earthquakeTable');

  // Setting current date
  currentDate.innerHTML = topTenEarthquakes.date;

  // Display messageRow
  messageRow("earthquakeTable", "Seek a location or city first", "info");

  // Init instance of Ajax, DataManager and googleMap Object
  var topTenDataManager = new DataManager();
  var dataManager       = new DataManager();
  var ajax              = new Ajax();
  var googleMap;
  var googleMapForCity;
  var cityCenter;
  // Define map options
  var mapOptions   = {
    center: {
      lat: 0,
      lng: 0
    },
    scrollwheel: false,
    zoom: 1
  };
  var mapForCityOptions = {
    scrollwheel: false,
    zoom: 4
  }
  ajax
    .request({
      type : "GET",
      url : earthquakesAPI + buildParamsFromObject(topTenEarthquakes)
    })
    .then(function (response) {
      if (response.earthquakes.length) {
        topTenDataManager.setData(response.earthquakes);
        fillTable("topTenTable", topTenDataManager.getData());
      }
    })
    .catch(function (error) {
      alert(error);
    });

  // Adding listeneres
  searchForm.addEventListener('submit', onSubmit);
  place.addEventListener('keyup', onKeyUp);
  sortByDate.addEventListener('click', onSort);
  restore.addEventListener('click', onRestore);
  toggleMap.addEventListener('click', onToggleMap);
  toggleMapCity.addEventListener('click', onToggleMapForCity);
  // CSS classes
  var successClass = 'has-success';
  var errorClass   = 'has-error';
  var asc = "fa-sort-amount-asc";
  var desc = "fa-sort-amount-desc";

  // Submit Callback
  function onSubmit (e){
    e.preventDefault();
    if (!place.value) {
      inputWrapper.classList.add(errorClass);
    } else {
      var searchedPlace = {
        address : encodeURIComponent(place.value)
      }
      ajax
        .request({
          type : "GET",
          url : googleMapAPI + buildParamsFromObject(searchedPlace)
        })
        .then(function (response) {
          if (response.status === 'OK') {
            var paramObject = {
              north : response.results[0].geometry.bounds.northeast.lat,
              south : response.results[0].geometry.bounds.southwest.lat,
              east  : response.results[0].geometry.bounds.northeast.lng,
              west  : response.results[0].geometry.bounds.southwest.lng,
              username : geoNamesUsername
            }
            cityCenter = response.results[0].geometry.location;
            displayName.innerHTML = response.results[0].formatted_address;
            return ajax.request({
              type : "GET",
              url : earthquakesAPI + buildParamsFromObject(paramObject)
            })
          } else {
            alert("City not found");
          }
        })
        .then(function (response) {
          if (response.earthquakes.length) {
            dataManager.setData(response.earthquakes);
            fillTable("earthquakeTable",dataManager.getData());
          } else {
            messageRow("earthquakeTable", "No earthquakes recorded", "info");
          }
          place.value = "";
          inputWrapper.classList.remove(successClass)
          place.blur();
          spinLoader('searchLoader', ajax.isLoading());
          if (restore.classList.contains('hide') && toggleMapCity.classList.contains('hide')) {
            restore.classList.toggle('hide');
            toggleMapCity.classList.toggle('hide');
          }
          if (!mapForCity.classList.contains('hide')) {
            mapForCityOptions.center = cityCenter;
            initMap(googleMapForCity, mapForCity, mapForCityOptions, dataManager);
          }
        })
        .catch(function (error) {
          alert(error);
        })
        spinLoader('searchLoader', ajax.isLoading());
    }
  }

  // Keyup callback
  function onKeyUp () {
    if (this.value) {
      if (inputWrapper.classList.contains(errorClass)) {
        inputWrapper.classList.remove(errorClass);
        inputWrapper.classList.add(successClass);
      } else {
        inputWrapper.classList.add(successClass);
      }
    } else {
      if (inputWrapper.classList.contains(successClass)) {
        inputWrapper.classList.remove(successClass);
        inputWrapper.classList.add(errorClass);
      }
    }
  }

  // Click callback for sort button
  function onSort (e) {
    var icon = this.children[0];
    if (icon.classList.contains(asc)) {
      icon.classList.remove(asc);
      icon.classList.add(desc);
    } else {
      icon.classList.remove(desc);
      icon.classList.add(asc);
    }
    var sortedData = dataManager.sortBy(this.id, icon.classList.contains(desc));
    fillTable("earthquakeTable", sortedData);
  }

  // Click callback for restore button
  function onRestore (e) {
    fillTable("earthquakeTable", dataManager.getData());
  }

  // Click callback for toggleMap button
  function onToggleMap (e) {
    topTenTable.classList.toggle('hide');
    var hidden = map.classList.toggle('hide');
    if (!hidden) {
      googleMap = new google.maps.Map(map, mapOptions);
      setMarkers(googleMap, topTenDataManager.getData());
    }
  }
  // Click callback for toggleMapForCity button
  function onToggleMapForCity(e) {
    earthquakeTable.classList.toggle('hide');
    var hidden = mapForCity.classList.toggle('hide');
    if (!hidden) {
      mapForCityOptions.center = cityCenter;
      initMap(googleMapForCity, mapForCity, mapForCityOptions, dataManager);
    }
  }
  // Helpers
  /**
  * buildParamsFromObject - build params for the url
  * @param Object  object
  * @return String
  **/
  function buildParamsFromObject (object) {
    return Object.keys(object).map(function (key, index) {
        return key + "=" + object[key];
      }).join('&');
  }
  /**
  * fillTable - creates rows for the table
  * @param Array data
  *
  **/
  function fillTable (tableId,data) {
    var table = document.querySelector('#' + tableId).getElementsByTagName('tbody')[0];
    if (table.rows)
      table.innerHTML = "";

    data
      .forEach(function (record, i) {
        var row       = table.insertRow(i);
        var index     = row.insertCell(0);
        var magnitude = row.insertCell(1);
        var lat       = row.insertCell(2);
        var lng       = row.insertCell(3);
        var registered_at = row.insertCell(4);
        index.innerHTML = record.rank;
        magnitude.innerHTML = record.magnitude;
        lat.innerHTML = record.lat;
        lng.innerHTML = record.lng;
        registered_at.innerHTML = record.datetime;
      });
  };

  function messageRow (tableId, message, type) {
    var table = document.querySelector('#' + tableId).getElementsByTagName('tbody')[0];
    if (table.rows)
      table.innerHTML = "";

    var row = table.insertRow(0);
    var messageCell = row.insertCell(0);
    messageCell.colSpan = 5;
    messageCell.classList.add(type);
    messageCell.classList.add("text-center");

    messageCell.innerHTML = message;
  };

  function spinLoader (spinnerId) {
    var loader  = document.querySelector('#' + spinnerId);
    loader.classList.toggle('hide');
  };

  function setMarkers (googleMap, data) {
    data
      .forEach(function (record) {
        var marker = new google.maps.Marker({
                map: googleMap,
                position: { lat : record.lat, lng : record.lng },
                title: "Magnitud : " + record.magnitude
              });
      })
  }
  function initMap(googleMapObject, mapWidget, mapOptionsObject, dataManagerObject) {
    googleMapObject = new google.maps.Map(mapWidget, mapOptionsObject);
    setMarkers(googleMapObject, dataManagerObject.getData());
  }
};
