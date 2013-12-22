'use strict';
describe("dust filters", function () {
    before(function () {
        var dust = { filters: {} };
        proxyquire('../front/dust/filters', { 'dustjs-linkedin': dust });
        this.f = dust.filters;
    });

    after(function () {});

    it('br', function () {
        expect(this.f.br('a\nb')).equal('a<br />b');
        expect(this.f.br('a\r\nb')).equal('a<br />b');
        expect(this.f.br('a\n\nb')).equal('a<br />b');
    });
});
