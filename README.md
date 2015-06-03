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

```sh
npm install
gulp dist
```

Please look at the example/index.html and try stuff out. 
Just open it in a browser and start having fun.

Or look at the unit tests (in progress)

Have a look at the couch_db folder...




## Test

### Single run

```sh
gulp test
```

### Autorun

```sh
gulp tests
```

# License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)


# TODO

* Prohibit `/` in _id's
* Add Attachment support
* make the Unit tests work
* Add coverage support

