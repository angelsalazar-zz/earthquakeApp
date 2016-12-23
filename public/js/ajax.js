"use strict";
/**
* Author : Angel Salazar Marcatoma
* Ajax class
*/
var Ajax = function () {
  //  XMLHttpRequest default browser ajax request
  //  ActiveXObject support for IE 5 and IE 6
  this.xhr = XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");;
  // loading flag
  this.loading = false;
  /**
  * request - performs an ajax request
  * @param options Object
  * @return Promise
  **/
  this.request = function (options) {
    // Get the object itself
    var self = this;
    // set ajax request status to loading;
    self.loading = true;
    // return Promise Object
    return new Promise(function (resolve, reject) {
      // Configure ajax request
      self.xhr.open(options.type, options.url, true);
      // add error listener
      self.xhr.addEventListener('load', function (e) {
        // if status is 200, then resolve request,
        // otherwise reject it
        if (e.currentTarget.status === 200) {
          resolve(JSON.parse(e.currentTarget.response));
        } else {
          reject("Whoops something went horribly wrong");
        }
        self.loading = false;
      });
      // add error listener
      self.xhr.addEventListener('error', function (e) {
        // if there is an error, reject
        reject("Whoops something went horribly wrong");
      })
      // send ajax request
      self.xhr.send(options.params);
    });
  };
  /**
  * isLoading - returns the ajax request status
  * @return boolean
  **/
  this.isLoading = function () {
    return this.loading;
  }
};
