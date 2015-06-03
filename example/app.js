/*
 * Copyright 2015 Ivo Woltring <webmaster@ivonet.nl>
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
   angular.module('app', ['IvoNetCouchDB']).config(function () {
   }).controller('CouchController', function (couchdb) {

      var self = this;

      self.intro = "Please login with appropriate credentials...";
      self.user = couchdb.user.name();
      self.roles = couchdb.user.roles();
      self.msg = '';
      self.server = couchdb.server.getUrl();
      couchdb.db.use("test");
      self.db = couchdb.db.getName();
      self.docs = [];

      self.login = function () {
         couchdb.user.login(myLogin.user.value, myLogin.pwd.value)
              .then(function (data) {
                 console.log("login: " + data);
                 self.msg = '';
                 self.user = data.name;
                 self.roles = data.roles;
              }, function (data) {
                 self.check();
                 self.msg = data.reason;
              }
         ).then(self.allDocs())
      };

      self.check = function () {
         couchdb.user.isAuthenticated().then(function (data) {
                 console.log("isAuthenticated: " + data);
                 self.user = couchdb.user.name();
                 self.roles = couchdb.user.roles();
                 self.allDocs();
              }, function (data) {
                 self.user = null;
                 self.msg = data.reason;
              }
         );
      };

      self.logout = function () {
         couchdb.user.logout().then(function () {
            self.check();
         });
      };

      self.serverLocation = function () {
         return couchdb.server.getUrl();
      };

      self.setServerLocation = function () {
         couchdb.server.setUrl(self.server)
      };

      self.databaseName = function () {
         return couchdb.db.getName();
      };

      self.setDatabase = function () {
         couchdb.db.use(self.db);
      };

      self.postDoc = function () {
         if (couchdb.db.getName() != null) {
            couchdb.doc.post(self.doc).then(function (data) {
                    console.log("post: " + JSON.stringify(data));
                    self.doc._rev = data.rev;
                    self.allDocs();
                 }, function (data) {
                    self.msg = data.reason;
                 }
            )
         } else {
            self.msg = "No DB defined..."
         }
      };

      self.putDoc = function () {
         if (couchdb.db.getName() != null) {
            couchdb.doc.put(self.doc).then(function (data) {
                    console.log("put: " + JSON.stringify(data));
                    self.doc._rev = data.rev;
                    self.allDocs();
                 }, function (data) {
                    self.msg = data.reason;
                 }
            )
         } else {
            self.msg = "No DB defined..."
         }
      };

      self.deleteDoc = function (doc) {
         couchdb.doc.delete(doc).then(function (data) {
            console.log("Deleted: " + data);
            self.allDocs();
            self.doc = {};
         }, function (data) {
            console.log(data);
            self.msg = data.reason;
         })
      };

      self.editDoc = function (id) {
         couchdb.doc.get(id).then(function (data) {
            self.doc = data;
         })
      };

      self.allDocs = function () {
         couchdb.doc.all().then(function (data) {
            console.log(JSON.stringify(data));
            self.docs = [];
            angular.forEach(data.rows, function (row) {
               self.docs.push({_id: row.id, _rev: row.value.rev})
            })
         })
      };

      self.check();
   });
})();

