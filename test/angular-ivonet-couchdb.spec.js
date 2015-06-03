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

describe('Doing basic functionality tests', function () {
   var $compile,
       $rootScope,
       $httpBackend,
       couch,
       config;
   beforeEach(module('ngMockE2E'));
   beforeEach(module('IvoNetCouchDB'));

   beforeEach(inject(function (_$compile_, _$rootScope_, couchdb, IvoNetCouchConfig, $injector) {
      $compile = _$compile_;
      $rootScope = _$rootScope_.$new();
      couch = couchdb;
      config = IvoNetCouchConfig;
      $httpBackend = $injector.get('$httpBackend');

   }));

   angular.module('IvoNetCouchDB').run(function ($httpBackend) {
      $httpBackend.whenPOST(/.*/).passThrough();
      $httpBackend.whenGET(/.*/).passThrough();
      $httpBackend.whenDELETE(/.*/).passThrough();
   });

   //it.ignore("should set the server url", function () {
   //   couch.server("http://ivonet.nl/api");
   //   expect(config.server).toBe("http://ivonet.nl/api");
   //});

   it("should login a valid user", function () {
      //$httpBackend.when('POST','http://127.0.0.1:5984/_session').passThrough();

      couch.user.login("ivo", "secret")
           .then(function () {
              console.log("asdfasdf");
              console.log(config.userCtx);
              expect(config.userCtx).toBe('{name: "ivo", roles: ["blogge"]}');

           }
      );
      //$httpBackend.flush();

   });

});