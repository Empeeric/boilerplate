'use strict';

var proxyquire = require('proxyquire'),
    assert = require('assert');

var dust = { filters: {} },
    f = dust.filters;

describe("dust filters", function () {
    var ctx = {};

    before(function (done) {
        proxyquire('../front/dust/filters', { dust: dust });
        done();
    });

    after(function () {});

    it('br', function (done) {
        assert.equal(f.br('a\nb'), 'a<br />b');
        assert.equal(f.br('a\r\nb'), 'a<br />b');
        assert.equal(f.br('a\n\nb'), 'a<br />b');
        done();
    });
});