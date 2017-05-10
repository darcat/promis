import React, { Component } from 'react';
import { Form, Button, Glyphicon } from 'react-bootstrap';
import Tooltip from './Tooltip';
import Quicklook from './Quicklook';

/* TODO: do you need this shared anywhere? */
function UnixToISO(unix_ts) {
    return new Date(unix_ts * 1e3).toISOString();
}

class DataSection extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data : new Array(),
            desc: '',
            quicklookStatus: false
        }

        console.log('at least');
        this.fetchData = this.fetchData.bind(this);
        this.downloadResult = this.downloadResult.bind(this);
        this.closeQuicklook = this.closeQuicklook.bind(this);
        this.showQuicklook = this.showQuicklook.bind(this);

        this.fetchData(this.props.mid);
    }

    fetchData() {
        console.log('fetching');
        var mid = this.props.mid;

        if(mid) {
            this.props.actions.getSingle('/en/api/download/' + mid + '/quicklook?source=parameter&points=100', {}, function(resp) {
                this.setState(function() {
                    return {
                        main: resp.source.name,
                        data: resp.data,
                        desc: resp.source.description,
                        time: resp.timelapse,
                        ylab: resp.value.name,
                        unit: resp.value.units
                    }
                })
            }.bind(this))
        }
    }

    /* only ascii for now */
    downloadResult() {
        if(this.props.mid) {
            let a = document.createElement('a');

            a.download = this.state.main + '.txt';
            a.href = '/en/api/download/' + this.props.mid + '/data/?format=ascii&source=parameter';
            a.click();
        }
        // http://localhost:8081/en/api/download/29/data/?format=ascii&source=parameter
    }

    showQuicklook() {
        this.setState(function() {
            return {
                quicklookStatus: true
            }
        })
    }

    closeQuicklook() {
        this.setState(function() {
            return {
                quicklookStatus: false
            }
        })
    }

    render() {
        return (
            <div>
                <Tooltip text = 'Quicklook'>
                    <Button onClick = {this.showQuicklook} bsSize = 'small'>
                        <Glyphicon glyph = 'stats' />
                    </Button>
                </Tooltip>
                <Tooltip text = 'Download'>
                    <Button onClick = {this.downloadResult} bsSize = 'small'>
                        <Glyphicon glyph = 'download-alt' />
                    </Button>
                </Tooltip>
                { this.state.data.length &&
                <Quicklook
                    data = {this.state.data}
                    title = {this.state.desc}
                    timelapse = {UnixToISO(this.state.time.start) + " – " + UnixToISO(this.state.time.end)}
                    ylabel = {this.state.ylab + " (" + this.state.unit + ")"}
                    onClose = {this.closeQuicklook}
                    show = {this.state.quicklookStatus}
                    time = {this.state.time}
                />
                }
            </div>
        )
    }
}

export default class SearchResults extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var results = this.props.results;

        if(this.props.results.fetch) {
            return (<div>Fetching data, please wait...</div>);
        } else {
            if(Array.isArray(results.data) && results.data.length > 0) {
                return (
                    <div>
                    <span>Found {results.data.length} result(s)</span>
                    <table className = 'table table-hover'>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Channel/Parameter name</th>
                                <th>Data size (approx)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            { results.data.map(function(mid, index) {
                                var date = 1;//result[0].date;
                                var name = 'name';//result[0].name;
                                var size = 'size unknown'; // result.size

                                return (
                                    <tr key = {index} data-name = 'mw1'>
                                        <td>{date}</td>
                                        <td>{name}</td>
                                        <td>{size}</td>
                                        <td>
                                            <DataSection
                                                mid = {mid}
                                                actions = {this.props.actions}
                                            />
                                        </td>
                                    </tr>
                                )
                            }.bind(this))
                            }
                        </tbody>
                    </table>
                    </div>
                )
            } else {
                return (
                    <span>Nothing has been found</span>
                )
            }
        }
    }
}
