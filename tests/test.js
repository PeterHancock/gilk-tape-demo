/*
# TAP (Test Anything Protocol) tests with `tape`
*/

var _ = require('lodash'),
    /* [tape](https://github.com/substack/tape) is explicitly `require`d - there is no global API */
    test = require('tape');

/*
    Running 10 tests with a little delay ...
*/
_.times(10, function (i) {
    /* A simple API */
    test('Test ' + i, function (assert) {
        assert.plan(1);
        setTimeout(function () {
            assert.pass();
        }, 50);
    });
});
