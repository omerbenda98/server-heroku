const request = require("supertest");
const { expect } = require("chai");
const express = require("express");
const setupApp = require("../app.js");

describe("GET /", () => {
  let app, server;

  before(() => {
    app = express();
    ({ app, server } = setupApp(app));
  });

  after(function (done) {
    if (server && server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  it("should return Hello World", (done) => {
    request(app)
      .get("/")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.equal("Hello World");
        done();
      });
  });
});
