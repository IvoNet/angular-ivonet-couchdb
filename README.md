# angular-ivonet-couchdb

An [AngularJS](https://angularjs.org) [CouchDB](http://couchdb.apache.org) module.

This module enables easy access to CouchDB from an angular application

## Prerequisites

* [CouchDB](http://couchdb.apache.org) installed and available on localhost
    * make sure you have at least one admin installed through futon (admin console)
* Run the couch_db/couch_db_setup.sh script (chmod +x it first) 
    * [CORS](https://github.com/IvoNet/couchdb-shell-scripts/blob/master/CORS.sh) is also a resource to look at.
    * Note that the 'origins' = '*' is not a good idea for production!
* curl if you want to use the couch_db script

## Build

```sh
npm install
gulp dist
```

Please look at the example/index.html and try stuff out. 
Just open it in a browser and start having fun.

Or look at the unit tests (in progress)

Have a look at the couch_db for an example setup script 

## Test

### Single run

```sh
gulp test
```

### Autorun

```sh
gulp tests
```

## Usage in Angular Project

```sh
bower install angular-ivonet-couchdb --save
```

or

```sh
npm install angular-ivonet-couchdb  --save
```

For the rest see the example (app.js and index.html)


## Bugs / Tips / Comments

Please contact me [here](http://www.ivonet.nl/home/contact)


# TODO

* Prohibit `/` in _id's
* Add Attachment support

# License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)

# Note

This repo is not maintained anymore as I do not use Couchdb at the moment.
When I do I will take it up again of use modules from others.

If you like to contribute please do a pull request and I will take the time to merge it and give credit where credit is due :-)


