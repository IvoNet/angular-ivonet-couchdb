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
      expect(config.usrCtx.name).toBe("ivo");
      expect(config.usrCtx.roles).toEqual(["blogger"]);
   });

   it("should not have a default db set", function () {
      "use strict";
      expect(config.db).toBe(null)
   });

   it("should have a default 'empty' usrCtx", function () {
      "use strict";
      expect(config.usrCtx.name).toBe(null);
      expect(config.usrCtx.roles).toEqual([]);
   });

   it("should fake a unresponsive server", function () {
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
           .respond({"ok": true, "usrCtx": {"name": "AuthUser", "roles": ["_admin"]}}
      );

      $httpBackend.expectDELETE();
      $httpBackend.whenDELETE("http://127.0.0.1:5984/_session")
           .respond(true);

      //tests
      couch.user.login("ivo", "secret")
           .then(function () {
              expect(couch.user.name()).toBe('ivo');
              expect(couch.user.roles()[0]).toBe("blogger");

              expect(config.usrCtx.name).toBe("ivo");
              expect(config.usrCtx.roles).toEqual(["blogger"]);

           }
      );

      couch.user.isAuthenticated().then(function (data) {
         "use strict";
         expect(data).toBe(true);
         expect(config.usrCtx.name).toBe("AuthUser");
         expect(config.usrCtx.roles).toEqual(["_admin"]);
      });

      couch.user.logout()
           .then(function () {
              expect(config.usrCtx.name).toBe(null);
              expect(config.usrCtx.roles).toEqual([]);
           }
      );

      //after
      $httpBackend.flush();
   });

});