"use strict";
/**
* Author : Angel Salazar
* DataManager Class
**/
var DataManager = function (array) {

  this.storage = [];
  /**
  * sortBy - allows sorting by specific property
  * @param String property
  * @param Boolean desc
  * @return Array
  **/
  this.sortBy = function (property, desc) {
    return desc ? this._quickSort(this.getData(), property) : this._quickSort(this.getData(), property).reverse();
  };

  /**
  * _quickSort - sorting Algorithm
  * @param Array array
  * @param String property
  * @return Array
  *
  **/
  this._quickSort = function (array, property) {
    if (array.length < 2)
      return array;

    var pivot = array[0];
    var left  = [];
    var right = [];

    for(var i = 1; i < array.length; i++) {
      if (array[i][property] < pivot[property]) {
        left.push(array[i]);
      } else {
        right.push(array[i]);
      }
    }

    return []
      .concat(this._quickSort(left, property), pivot, this._quickSort(right, property));
  }

  /**
  * getData - returns stored data
  * @return Array
  **/
  this.getData = function () {
    return this.storage;
  };

  /**
  * setData - populate storage property
  * @param Array array
  **/
  this.setData = function (array) {
    // formatting records in order to sort by date
    this.storage = array.map(function (record, i) {
      record.rank = (i + 1);
      record.time = new Date(record.datetime.replace('-','/')).getTime();
      return record;
    });
  };

  /**
  *
  *
  **/
  this.hasData = function () {
    return (this.storage.length > 0)
  };
};
