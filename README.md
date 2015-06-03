# angular-ivonet-couchdb

An [AngularJS](https://angularjs.org) [CouchDB](http://couchdb.apache.org) module.

This module enables easy access to CouchDB from an angular application

## Prerequisites

* [CouchDB](http://couchdb.apache.org) installed and available on localhost
    * make sure you have at least one admin installed through futon (admin console)
* Run the couch_db/couch_db_setup.sh script (chmod +x it first) 
    * [CORS](https://github.com/IvoNet/couchdb-shell-scripts/blob/master/CORS.sh) is also a resource to look at.
    * Note that the 'origins' = '*' is not a good idea for production!


## Usage

'''sh
npm install
bower install
gulp
'''

Please look at the test/index.html and try stuff out. 
Just open it in a browser and start having fun.

