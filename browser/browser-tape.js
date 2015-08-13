var tape = require('tape'),
    tap = require('faucet'),
    parser = require('tap-parser'),
    through = require('through'),
    Terminal = require('terminal.js'),
    React = require('react');

    var tapeStream = tape.createStream();

    var consoleEl = document.getElementById('browser-tape-console'),
        summaryEl = document.getElementById('browser-tape-summary');

    if (consoleEl) {
        var term = new Terminal({columns: 200, rows: 10});
        tapeStream
            .pipe(through(function (data) {
                console.log(data);
                this.queue(data);
            }))
            .pipe(tap({width: 200 }))
            .pipe(through(function (data) {
                this.queue(data.toString());
            }))
            .pipe(term);
        term.dom(consoleEl);
    }

    if (summaryEl) {
        var TapSummary = React.createClass({
            ready: function () {
                return <span>{this.props.pass}/{this.props.count} passed</span>;
            },
            getClass: function () {
                if (this.props.count) {
                    if (this.props.ok) {
                        return "pass";
                    } else {
                        return "fail";
                    }
                } else {
                    return "running";
                }
            },
            render: function () {
                return <div>TAP Tests: <span className={this.getClass()}>{this.props.count ? this.ready() : 'running \u2026'}</span></div>
            }
        });
        tapeStream.pipe(parser(function (results) {
            React.render(<TapSummary {...results} />, document.getElementById('browser-tape-summary'));
        }));
        React.render(<TapSummary  />, summaryEl);
    }
