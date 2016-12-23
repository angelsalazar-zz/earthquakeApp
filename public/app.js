"use strict";
// Table.prototype.fillTable = function (array) {
//
// };
// http://api.geonames.org/earthquakesJSON?north=89.45016124669523&south=-87.71179927260242&east=180&west=-180&username=angelsalazar1992&date=2016-12-23&minMagnitude=7
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
  var searchForm   = document.querySelector('#searchForm');
  var inputWrapper = document.querySelector('#inputWrapper');
  var place        = document.querySelector('#place');
  var sortByDate   = document.querySelector('#time');
  var displayName  = document.querySelector('#display');
  var currentDate  = document.querySelector('#currentDate');
  var currentDate  = document.querySelector('#currentDate');
  var hint         = document.querySelector('#hint');
  var restore      = document.querySelector('#restore');

  // Setting current date
  currentDate.innerHTML = topTenEarthquakes.date;

  // Display messageRow
  messageRow("earthquakeTable", "Seek a location or city first", "info");
  // Init instance of Ajax and DataManager
  var ajax         = new Ajax();
  var dataManager  = new DataManager();

  ajax
    .request({
      type : "GET",
      url : earthquakesAPI + buildParamsFromObject(topTenEarthquakes)
    })
    .then(function (response) {
      if (response.earthquakes.length) {
        dataManager.setData(response.earthquakes);
        fillTable("topTenTable", dataManager.getData());
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
  // CSS classes
  var successClass = 'has-success';
  var errorClass   = 'has-error';
  var asc = "fa-sort-amount-asc";
  var desc = "fa-sort-amount-desc";

  // Submit Callback
  function onSubmit(e){
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
          if (restore.classList.contains('hide'))
            restore.classList.toggle('hide');
        })
        .catch(function (error) {
          alert(error);
        })
        spinLoader('searchLoader', ajax.isLoading());
    }
  }

  // Keyup callback
  function onKeyUp() {
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
  function onRestore(e) {
    fillTable("earthquakeTable", dataManager.getData());
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
  }
  function spinLoader (spinnerId) {
    var loader  = document.querySelector('#' + spinnerId);
    loader.classList.toggle('hide');
  }

};
