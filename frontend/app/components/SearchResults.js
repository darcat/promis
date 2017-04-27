import React, { Component } from 'react';
import { Form, Button, Glyphicon } from 'react-bootstrap';
import Tooltip from './Tooltip';
import Quicklook from './Quicklook';

class DataSection extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data : new Array(),
            desc: '',
            quicklookStatus: false
        }

        this.fetchData = this.fetchData.bind(this);
        this.downloadResult = this.downloadResult.bind(this);
        this.closeQuicklook = this.closeQuicklook.bind(this);
        this.showQuicklook = this.showQuicklook.bind(this);

        this.fetchData(this.props.mid);
    }

    fetchData() {
        var mid = this.props.mid;

        if(mid) {
            this.props.actions.makeQuery('/en/api/quicklook/' + mid + '/parameter/?points=100', {}, function(resp) {
                this.setState(function() {
                    return {
                        data: resp.data.mv,
                        desc: resp.parameter.description
                    }
                })
            }.bind(this))
        }
    }

    downloadResult() {
        window.alert('Not implemented yet');
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
                    xlabel = {this.props.xlabel}
                    ylabel = {this.props.ylabel}
                    onClose = {this.closeQuicklook}
                    show = {this.state.quicklookStatus}
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
        var results = this.props.results;//onResult();

        //console.log('FFFF', results);

        if(results && results.length) {
            return (
                <div>
                <span>Found {results.length} result(s)</span>
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
                        { results.map(function(result, index) {
                            var date = result[0].date;
                            var mid = result[0].mid;
                            var name = result[0].name;
                            var size = 'size unknown'; // result.size

                            return (
                                <tr key = {index} data-name = 'mw1'>
                                    <td>{date}</td>
                                    <td>{name}</td>
                                    <td>{size}</td>
                                    <td>
                                        <DataSection
                                            mid = {index + 1}
                                            actions = {this.props.restActions}
                                            xlabel = {'x data label'}
                                            ylabel = {'y data label'}
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
