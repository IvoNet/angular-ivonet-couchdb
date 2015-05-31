/*
 * Copyright 2015 ivonet
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {

   function IvoNetCouchConfigProvider() {
      return {
         serverUrl: 'http://127.0.0.1:5984',
         setServer: function (url) {
            this.serverUrl = url;
         },
         db: null,
         setDB: function (db) {
            this.db = db;
         },
         usrCtx: {name: null, roles: []},
         $get: function () {
            return {
               server: this.serverUrl,
               usrCtx: this.usrCtx
            }
         }
      }
   }

   CouchDB.$inject = [
      'IvoNetCouchConfig',
      '$http',
      '$q'
   ];
   function CouchDB(IvoNetCouchConfig, $http, $q) {
      var encodeUri = function (base, part1, part2) {
         var uri = base;
         if (part1) {
            uri = uri + "/" + encodeURIComponent(part1);
         }
         if (part2) {
            uri = uri + "/" + encodeURIComponent(part2);
         }
         return uri.replace('%2F', '/');
      };

      var getDbUri = function () {
         return encodeUri(IvoNetCouchConfig.server, IvoNetCouchConfig.db);
      };

      var getSessionUrl = function () {
         "use strict";
         return encodeUri(IvoNetCouchConfig.server) + "/_session"
      };

      return {
         server: {
            setUrl: setServerUrl, //done
            getUrl: getServerUrl //done
         },
         db: {
            use: setDB, //done
            getName: getDBName //done
         },
         user: {
            login: login, //done
            logout: logout, //done
            session: session, //done
            isAuthenticated: isAuthenticated, //done
            name: getUserName, //done
            roles: getUserRoles //done
            //TODO createUser? deleteUser?
         },
         doc: {
            post: postDoc, //done
            delete: deleteDoc, //done
            get: getDoc, //done
            put: putDoc, //done
            all: getAllDocs //done
         }

      };

      function setServerUrl(url) {
         IvoNetCouchConfig.server = url;
      }

      function getServerUrl() {
         return IvoNetCouchConfig.server;
      }

      function setDB(db) {
         IvoNetCouchConfig.db = db;
      }

      function getDBName() {
         return IvoNetCouchConfig.db;
      }

      function login(usr, pwd) {
         var body = "name=" + encodeURIComponent(usr) + "&password=" + encodeURIComponent(pwd);
         var deferred = $q.defer();
         $http({
            method: "POST",
            url: encodeUri(IvoNetCouchConfig.server) + "/_session",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            data: body.replace(/%20/g, "+"),
            withCredentials: true
         }).success(function (data) {
            delete data["ok"];
            data.name = usr;
            IvoNetCouchConfig.usrCtx = data;
            deferred.resolve(data);
         }).error(function (data, status) {
            if (data === null) {
               data = {
                  error: "Service Unavailable",
                  reason: "The Server may be down"
               }
            }
            deferred.reject({
               status: status,
               reason: data.reason,
               error: data.error
            })
         });
         return deferred.promise;
      }

      function logout() {
         var deferred = $q.defer();
         $http({
            method: "DELETE",
            url: getSessionUrl(),
            withCredentials: true
         }).success(function () {
            IvoNetCouchConfig.usrCtx = {name: null, roles: []};
            deferred.resolve(true)
         });
         return deferred.promise;
      }

      function session() {
         var deferred = $q.defer();
         $http({
            method: "GET",
            url: getSessionUrl(),
            withCredentials: true
         }).success(function (data) {
            deferred.resolve(data.userCtx);
         });
         return deferred.promise;
      }

      function isAuthenticated() {
         var deferred = $q.defer();
         $http({
            method: "GET",
            url: getSessionUrl(),
            withCredentials: true
         }).success(function (data) {
            console.log(data);
            IvoNetCouchConfig.usrCtx = data.userCtx;
            deferred.resolve(data.userCtx.name !== null);
         }).error(function (data, status) {
            if (data === null) {
               data = {
                  error: "Service Unavailable",
                  reason: "The Server may be down"
               }
            }
            deferred.reject({
               status: status,
               reason: data.reason,
               error: data.error
            })
         });
         return deferred.promise;
      }

      function getUserName() {
         return IvoNetCouchConfig.usrCtx.name;
      }

      function getUserRoles() {
         return IvoNetCouchConfig.usrCtx.roles;
      }

      function postDoc(doc) {
         console.log("post: " + doc);
         var deferred = $q.defer();
         $http({
            method: "POST",
            url: getDbUri(),
            data: doc,
            headers: {'Content-Type': 'application/json'},
            withCredentials: true
         }).success(function (data) {
            delete data["ok"];
            deferred.resolve(data);
         }).error(function (data, status) {
            if (data === null) {
               data = {
                  error: "Service Unavailable",
                  reason: "The Server may be down"
               }
            }
            deferred.reject({
               status: status,
               reason: data.reason,
               error: data.error
            })

         });
         return deferred.promise;
      }

      function putDoc(data) {
         var deferred = $q.defer();
         $http({
            method: "PUT",
            url: encodeUri(getDbUri(), data._id),
            data: data,
            headers: {'Content-Type': 'application/json'},
            withCredentials: true
         }).success(function (data) {
            deferred.resolve(data);
         }).error(function (data, status) {
            if (data === null) {
               data = {
                  error: "Service Unavailable",
                  reason: "The Server may be down"
               }
            }
            deferred.reject({
               status: status,
               reason: data.reason,
               error: data.error
            })

         });
         return deferred.promise;
      }

      function deleteDoc(doc) {
         var deferred = $q.defer();
         if (doc._id === undefined || doc._rev === undefined) {
            deferred.reject({
               status: 400,
               reason: "Bad Request",
               error: "When deleting both _id and _rev must be present in the document"
            });
            return deferred.promise;
         }
         $http({
            method: "DELETE",
            url: encodeUri(getDbUri(), doc._id),
            params: {rev: doc._rev},
            withCredentials: true
         }).success(function (data) {
            deferred.resolve(data);
         }).error(function (data, status) {
            if (data === null) {
               data = {
                  error: "Service Unavailable",
                  reason: "The Server may be down"
               }
            }
            deferred.reject({
               status: status,
               reason: data.reason,
               error: data.error
            })
         });
         return deferred.promise;
      }

      function getDoc(id) {
         var deferred = $q.defer();
         $http({
            method: "GET",
            url: encodeUri(getDbUri(), id)
         }).success(function (data) {
            deferred.resolve(data);
         });
         return deferred.promise;
      }

      function getAllDocs() { //TODO Provide a limit to get
         var deferred = $q.defer();
         $http({
            method: "GET",
            url: encodeUri(getDbUri(), "/_all_docs"),
            withCredentials: true
         }).success(function (data) {
            //Remove all design documents
            for (var i = data.rows.length - 1; i >= 0; i--) {
               if (data.rows[i].id.indexOf('_design') >= 0) {
                  delete data.rows.splice(i, 1);
               }
            }
            data.total_rows = data.rows.length;
            deferred.resolve(data);
         });
         return deferred.promise;
      }

   }

   angular.module('IvoNetCouchDB', [])
        .provider('IvoNetCouchConfig', IvoNetCouchConfigProvider)
        .factory('couchdb', CouchDB);

})();
