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

describe('Login function and the ConfigProvider', function () {
   var $compile,
       $rootScope,
       $httpBackend,
       couch,
       config;

   beforeEach(module('IvoNetCouchDB'));

   beforeEach(inject(function (_$compile_, _$rootScope_, _$httpBackend_, couchdb, IvoNetCouchConfig) {
      $compile = _$compile_;
      $rootScope = _$rootScope_.$new();
      $httpBackend = _$httpBackend_;
      couch = couchdb;
      config = IvoNetCouchConfig;
   }));

   it("should have the default url set from the config", function () {
      expect(couch.server.getUrl()).toBe("http://127.0.0.1:5984");
      expect(config.server).toBe("http://127.0.0.1:5984")
   });

   it("should set the config.server url through the module", function () {
      //prepare
      couch.server.setUrl("http://ivonet.nl/api");

      //test
      expect(couch.server.getUrl()).toBe("http://ivonet.nl/api");
      expect(config.server).toBe("http://ivonet.nl/api");

   });

   it("should set the server url in through config", function () {
      //prepare
      config.server = "http://ivonet.nl/api";

      //test
      expect(couch.server.getUrl()).toBe("http://ivonet.nl/api");
      expect(config.server).toBe("http://ivonet.nl/api");

   });

   it("should login a valid user", function () {

      //prepare
      $httpBackend.whenPOST("http://127.0.0.1:5984/_session")
           .respond({
              "ok": true,
              "name": "user", //will be overwritten in the login method
              "roles": ["blogger"]
           });

      //test
      couch.user.login("ivo", "secret")
           .then(function () {
              expect(couch.user.name()).toBe('ivo');
              expect(couch.user.roles()[0]).toBe("blogger");
           }
      );

      //after
      $httpBackend.flush();
      expect(config.userCtx.name).toBe("ivo");
      expect(config.userCtx.roles).toEqual(["blogger"]);
   });

   it("should not have a default db set", function () {
      "use strict";
      expect(config.db).toBe(null)
   });

   it("should have a default 'empty' usrCtx", function () {
      "use strict";
      expect(config.userCtx.name).toBe(null);
      expect(config.userCtx.roles).toEqual([]);
   });

   it("should fake a unresponsive server", function () {
      $httpBackend.expectPOST();
      $httpBackend.whenPOST("http://127.0.0.1:5984/_session")
           .respond(0, null);

      //test
      couch.user.login("ivo", "secret")
           .then(function (data) {
              fail("should not get here");
           }, function (data) {
              expect(data.status).toBe(503);
              expect(data.error).toBe("Service Unavailable");
              expect(data.reason).toBe("The server may be down.");
           }
      );

      //after
      $httpBackend.flush();
   });

   it("should fake a unresponsive server", function () {
      $httpBackend.whenPOST("http://127.0.0.1:5984/_session")
           .respond(403, {
              "error": "forbidden",
              "reason": "Only users with role blogger or an admin can modify this database."
           });

      //test
      couch.user.login("ivo", "secret")
           .then(function (data) {
              fail("should not get here");
           }, function (data) {
              expect(data.status).toBe(403);
              expect(data.error).toBe("forbidden");
              expect(data.reason).toBe("Only users with role blogger or an admin can modify this database.");
           }
      );

      //after
      $httpBackend.flush();
   });

   it("should do a good login and logout with authenticated test in between", function () {

      //prepare
      $httpBackend.expectPOST();
      $httpBackend.whenPOST("http://127.0.0.1:5984/_session")
           .respond({
              "ok": true,
              "name": "user", //will be overwritten in the login method
              "roles": ["blogger"]
           });

      $httpBackend.expectGET();
      $httpBackend.whenGET("http://127.0.0.1:5984/_session")
           .respond({"ok": true, "userCtx": {"name": "AuthUser", "roles": ["_admin"]}});

      $httpBackend.expectDELETE();
      $httpBackend.whenDELETE("http://127.0.0.1:5984/_session")
           .respond(true);

      //tests
      couch.user.login("ivo", "secret")
           .then(function () {
              expect(couch.user.name()).toBe('ivo');
              expect(couch.user.roles()[0]).toBe("blogger");

              expect(config.userCtx.name).toBe("ivo");
              expect(config.userCtx.roles).toEqual(["blogger"]);

           }
      );

      couch.user.isAuthenticated().then(function (data) {
         expect(data).toBe(true);
         expect(config.userCtx.name).toBe("AuthUser");
         expect(config.userCtx.roles).toEqual(["_admin"]);
      });

      couch.user.logout()
           .then(function () {
              expect(config.userCtx.name).toBe(null);
              expect(config.userCtx.roles).toEqual([]);
           }
      );

      //after
      $httpBackend.flush();
   });

   it("should play at being not logged in", function () {

      //prepare
      config.userCtx.name = "IAmNotNullAtStartOfTest";
      $httpBackend.expectGET();
      $httpBackend.whenGET("http://127.0.0.1:5984/_session")
           .respond({"ok": true, "userCtx": {"name": null, "roles": []}}
      );

      //test
      couch.user.isAuthenticated().then(function (data) {
         expect(data).toBe(false);
         expect(config.userCtx.name).toBe(null);
      });

      //after
      $httpBackend.flush();

   });

   it("should play at not having connection when asking for Authentication", function () {
      $httpBackend.expectGET();
      $httpBackend.whenGET("http://127.0.0.1:5984/_session")
           .respond(0, null);

      couch.user.isAuthenticated().then(function (data) {
         fail("Should never be here");
      }, function (data) {
         expect(data.status).toBe(503);
         expect(data.error).toBe("Service Unavailable");
         expect(data.reason).toBe("The server may be down.");
      });

      //after
      $httpBackend.flush();
   });

   it("should POST a doc and succeed (happy flow)", function () {
      //prepare
      var doc = {"_id": "fooId", "data": "content"};
      couch.db.use("testdb");

      $httpBackend.expectPOST("http://127.0.0.1:5984/testdb", doc);
      $httpBackend.whenPOST("http://127.0.0.1:5984/testdb")
           .respond({"ok": true, "id": "fooId", "rev": "1-b8f7e9716f3965248ff57f57bd25afb6"});

      //tests
      couch.doc.post(doc).then(function (data) {
         expect(data.id).toBe("fooId");
         expect(data.rev).toBe("1-b8f7e9716f3965248ff57f57bd25afb6");
      });

      //after
      $httpBackend.flush();
   });

   it("should play at trying to post a doc that already exists and where no _rev is provided", function () {
      //prepare
      var doc = {"_id": "fooId", "data": "content"};
      couch.db.use("testdb");

      $httpBackend.expectPOST("http://127.0.0.1:5984/testdb", doc);
      $httpBackend.whenPOST("http://127.0.0.1:5984/testdb")
           .respond(409, {"error": "conflict", "reason": "Document update conflict."});

      //tests
      couch.doc.post(doc).then(function (data) {
         "use strict";
         fail("Should not reach this code")
      }, function (data) {
         expect(data.status).toBe(409);
         expect(data.error).toBe("conflict");
         expect(data.reason).toBe("Document update conflict.");
      });

      //after
      $httpBackend.flush();
   });

   it("should play at trying to post a doc but having not the correct rights", function () {
      //prepare
      var doc = {"_id": "fooId", "data": "content"};
      couch.db.use("testdb");

      $httpBackend.expectPOST("http://127.0.0.1:5984/testdb", doc);
      $httpBackend.whenPOST("http://127.0.0.1:5984/testdb")
           .respond(403, {
              "error": "forbidden",
              "reason": "Only users with role blogger or an admin can modify this database."
           });

      //tests
      couch.doc.post(doc).then(function (data) {
         "use strict";
         fail("Should not reach this code")
      }, function (data) {
         expect(data.status).toBe(403);
         expect(data.error).toBe("forbidden");
         expect(data.reason).toBe("Only users with role blogger or an admin can modify this database.");

      });

      //after
      $httpBackend.flush();
   });

   it("should play at trying to post a doc but having no connection", function () {
      //prepare
      var doc = {"_id": "fooId", "data": "content"};
      couch.db.use("testdb");

      $httpBackend.expectPOST("http://127.0.0.1:5984/testdb", doc);
      $httpBackend.whenPOST("http://127.0.0.1:5984/testdb")
           .respond(0, null);

      //tests
      couch.doc.post(doc).then(function (data) {
         "use strict";
         fail("Should not reach this code")
      }, function (data) {
         expect(data.status).toBe(503);
      });

      //after
      $httpBackend.flush();
   });

   //PUT
   it("should PUT a doc and succeed (happy flow)", function () {
      //prepare
      var doc = {"_id": "fooId", "data": "content"};
      couch.db.use("testdb");

      $httpBackend.expectPUT("http://127.0.0.1:5984/testdb/fooId", doc);
      $httpBackend.whenPUT("http://127.0.0.1:5984/testdb/fooId")
           .respond({"ok": true, "id": "fooId", "rev": "1-b8f7e9716f3965248ff57f57bd25afb6"});

      //tests
      couch.doc.put(doc).then(function (data) {
         expect(data.id).toBe("fooId");
         expect(data.rev).toBe("1-b8f7e9716f3965248ff57f57bd25afb6");
      });

      //after
      $httpBackend.flush();
   });

   it("should play at trying to PUT a doc that already exists and where no _rev is provided", function () {
      //prepare
      var doc = {"_id": "fooId", "data": "content"};
      couch.db.use("testdb");

      $httpBackend.expectPUT("http://127.0.0.1:5984/testdb/fooId", doc);
      $httpBackend.whenPUT("http://127.0.0.1:5984/testdb/fooId")
           .respond(409, {"error": "conflict", "reason": "Document update conflict."});

      //tests
      couch.doc.put(doc).then(function (data) {
         "use strict";
         fail("Should not reach this code")
      }, function (data) {
         expect(data.status).toBe(409);
         expect(data.error).toBe("conflict");
         expect(data.reason).toBe("Document update conflict.");
      });

      //after
      $httpBackend.flush();
   });

   it("should play at trying to PUT a doc but having not the correct rights", function () {
      //prepare
      var doc = {"_id": "fooId", "data": "content"};
      couch.db.use("testdb");

      $httpBackend.expectPUT("http://127.0.0.1:5984/testdb/fooId", doc);
      $httpBackend.whenPUT("http://127.0.0.1:5984/testdb/fooId")
           .respond(403, {
              "error": "forbidden",
              "reason": "Only users with role blogger or an admin can modify this database."
           });

      //tests
      couch.doc.put(doc).then(function (data) {
         "use strict";
         fail("Should not reach this code")
      }, function (data) {
         expect(data.status).toBe(403);
         expect(data.error).toBe("forbidden");
         expect(data.reason).toBe("Only users with role blogger or an admin can modify this database.");

      });

      //after
      $httpBackend.flush();
   });

   it("should play at trying to put a doc but having no connection", function () {
      //prepare
      var doc = {"_id": "fooId", "data": "content"};
      couch.db.use("testdb");

      $httpBackend.expectPUT("http://127.0.0.1:5984/testdb/fooId", doc);
      $httpBackend.whenPUT("http://127.0.0.1:5984/testdb/fooId")
           .respond(0, null);

      //tests
      couch.doc.put(doc).then(function (data) {
         "use strict";
         fail("Should not reach this code")
      }, function (data) {
         expect(data.status).toBe(503);
      });

      //after
      $httpBackend.flush();
   });

   it("shoudl play at deleting a document and succeding", function () {
      //prepare
      var doc = {"_id": "fooId", "_rev": "revId"};
      couch.db.use("testdb");

      $httpBackend.expectDELETE("http://127.0.0.1:5984/testdb/fooId?rev=revId");
      $httpBackend.whenDELETE("http://127.0.0.1:5984/testdb/fooId?rev=revId")
           .respond({"ok": true, "id": "fooId", "rev": "revId"});

      //tests
      couch.doc.delete(doc).then(function (data) {
         expect(data.id).toBe("fooId");
         expect(data.rev).toBe("revId");
      });

      //after
      $httpBackend.flush();
   });

   it("shoudl play at deleting a document and having no connection", function () {
      //prepare
      var doc = {"_id": "fooId", "_rev": "revId"};
      couch.db.use("testdb");

      $httpBackend.expectDELETE("http://127.0.0.1:5984/testdb/fooId?rev=revId");
      $httpBackend.whenDELETE("http://127.0.0.1:5984/testdb/fooId?rev=revId")
           .respond(0, null);

      //tests
      couch.doc.delete(doc).then(function (data) {
         fail("never reach this")
      }, function (data) {
         expect(data.status).toBe(503);
      });

      //after
      $httpBackend.flush();
   });

   it("shoudl play at deleting a document and having not the right credentials", function () {
      //prepare
      var doc = {"_id": "fooId", "_rev": "revId"};
      couch.db.use("testdb");

      $httpBackend.expectDELETE("http://127.0.0.1:5984/testdb/fooId?rev=revId");
      $httpBackend.whenDELETE("http://127.0.0.1:5984/testdb/fooId?rev=revId")
           .respond(403, {
              "error": "forbidden",
              "reason": "Only users with role blogger or an admin can modify this database."
           });

      //tests
      couch.doc.delete(doc).then(function (data) {
         "use strict";
         fail("Should not reach this code")
      }, function (data) {
         expect(data.status).toBe(403);
         expect(data.error).toBe("forbidden");
         expect(data.reason).toBe("Only users with role blogger or an admin can modify this database.");
      });

      //after
      $httpBackend.flush();
   });

   it("should play at retrieving a doc and succeeding", function () {
      var doc = {"ok": true, "_id": "fooId", "_rev": "revId", "data": "content"};
      couch.db.use("testdb");

      //prepare
      $httpBackend.expectGET("http://127.0.0.1:5984/testdb/fooId");
      $httpBackend.whenGET("http://127.0.0.1:5984/testdb/fooId")
           .respond(doc);

      couch.doc.get("fooId").then(function (data) {
         expect(data._id).toBe("fooId")
      });

      //after
      $httpBackend.flush();
   });

   it("should play at retrieving a doc and having no connection", function () {
      couch.db.use("testdb");

      //prepare
      $httpBackend.expectGET("http://127.0.0.1:5984/testdb/fooId");
      $httpBackend.whenGET("http://127.0.0.1:5984/testdb/fooId")
           .respond(0, null);

      couch.doc.get("fooId").then(function (data) {
         fail("Never reach this")
      }, function (data) {
         expect(data.status).toBe(503);
      });

      //after
      $httpBackend.flush();
   });

   it("should play at retrieving a doc and having no rights", function () {
      couch.db.use("testdb");

      //prepare
      $httpBackend.expectGET("http://127.0.0.1:5984/testdb/fooId");
      $httpBackend.whenGET("http://127.0.0.1:5984/testdb/fooId")
           .respond(403, {
              "error": "forbidden",
              "reason": "Only readers may access"
           });

      couch.doc.get("fooId").then(function (data) {
         fail("Never reach this")
      }, function (data) {
         expect(data.status).toBe(403);
         expect(data.error).toBe("forbidden");
         expect(data.reason).toBe("Only readers may access");
      });

      //after
      $httpBackend.flush();
   });

   it("should play at retrieving all docs and succeeding", function () {
      var doc = {
         "total_rows": 3,
         "offset": 0,
         "rows": [
            {
               "id": "_design/_auth",
               "key": "_design/_auth",
               "value": {"rev": "1-3ce65f7deffc664ae36db7d39c8f22d6"}
            },
            {"id": "112", "key": "112", "value": {"rev": "1-704ef9028f3157c9bfef9567d269289e"}},
            {
               "id": "asdfasdfasdfasdf",
               "key": "asdfasdfasdfasdf",
               "value": {"rev": "1-704ef9028f3157c9bfef9567d269289e"}
            }
         ]
      };
      couch.db.use("testdb");

      //prepare
      $httpBackend.expectGET("http://127.0.0.1:5984/testdb/_all_docs");
      $httpBackend.whenGET("http://127.0.0.1:5984/testdb/_all_docs")
           .respond(doc);

      couch.doc.all().then(function (data) {
         expect(data.total_rows).toBe(2);
         for (var i = data.rows.length - 1; i >= 0; i--) {
            if (data.rows[i].id.indexOf('_design') >= 0) {
               fail("should not have found a design document")
            }
         }
      });
      //after
      $httpBackend.flush();
   });

   it("should play at retrieving all docs and having no connection", function () {
      couch.db.use("testdb");

      //prepare
      $httpBackend.expectGET("http://127.0.0.1:5984/testdb/_all_docs");
      $httpBackend.whenGET("http://127.0.0.1:5984/testdb/_all_docs")
           .respond(0, null);

      couch.doc.all().then(function (data) {
         fail("Never reach this")
      }, function (data) {
         expect(data.status).toBe(503);
      });

      //after
      $httpBackend.flush();
   });

   it("should play at retrieving all docs and having no rights", function () {
      couch.db.use("testdb");

      //prepare
      $httpBackend.expectGET("http://127.0.0.1:5984/testdb/_all_docs");
      $httpBackend.whenGET("http://127.0.0.1:5984/testdb/_all_docs")
           .respond(403, {
              "error": "forbidden",
              "reason": "Only readers may access"
           });

      couch.doc.all().then(function (data) {
         fail("Never reach this")
      }, function (data) {
         expect(data.status).toBe(403);
         expect(data.error).toBe("forbidden");
         expect(data.reason).toBe("Only readers may access");
      });

      //after
      $httpBackend.flush();
   });

});