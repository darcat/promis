import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { LineChart } from 'rd3';
import { Button } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import { dataURLToBlob } from 'blob-util';
import Modal from './Modal';

export default class Quicklook extends Component {
    constructor(props) {
        super(props);

        this.svg = null;

        this.width = this.props.width;
        this.height = this.props.height;
        this.saveMe = this.saveMe.bind(this);
        this.formatData = this.formatData.bind(this);
        this.makeFilename = this.makeFilename.bind(this);
        this.makeWatermark = this.makeWatermark.bind(this);
        this.data = this.formatData(this.props.data);
    }

    componentDidMount() {
        /* get rendered SVG graph element */
        this.svg = findDOMNode(this.el).querySelector('svg');
    }

    makeWatermark(canvas, context) {
        let hw = canvas.width / 2, hh = canvas.height / 2;
        let fs = 24;

        context.save();
        context.rotate( - Math.PI / 4 );

        function random(of) {
            return Math.floor((Math.random() * of) + 1);
        }

        for(let i = 0; i < hh; i ++) {
            context.font = 'italic ' + fs + 'px sans';
            context.fillStyle = 'rgba(' + random(255) + ', ' + random(192) + ', ' + random(192) + ', 0.1)';
            context.textAlign = 'center';
            context.fillText(this.props.watermarkText, random(hw * 2) - hw, i * (fs * 2));
        }

        context.restore();
    }

    makeFilename() {
        return this.props.title + ' quicklook.png';
    }

    saveMe() {
        if(this.svg) {
            var canvas = null, context = null;
            var imageData = null, image = null;

            /* setup offscreen canvas */
            canvas = document.createElement('canvas');
            canvas.width = this.props.graphWidth;
            canvas.height = this.props.graphHeight;

            /* obtain context and make white bg */
            context = canvas.getContext('2d');//offscreen.getContext('2d');
            context.fillStyle = 'white'
            context.fillRect(0, 0, canvas.width, canvas.height);

            /* create new image from svg */
            imageData = 'data:image/svg+xml,' + new XMLSerializer().serializeToString(this.svg);
            image = new Image();

            /* draw image callback */
            image.onload = function() {
                context.drawImage(image, 0, 0);

                this.makeWatermark(canvas, context);

                dataURLToBlob(canvas.toDataURL('image/png')).then(function(blob) {
                    saveAs(blob, this.makeFilename());
                }.bind(this));
            }.bind(this);

            /* set image data and trigger callback when done */
            image.src = imageData;
        }
    }

    formatData(data) {
        var dataObj = [
        {
            name: 'series3',
            values: null,
            strokeWidth: 3,
        } ];

        var formatted = new Array();

        if(Array.isArray(data)) {
            data.map(function(item, index) {
                formatted.push({ x: index, y: item });
            })
        } else formatted = [{ x: 0, y: 20 }, { x: 1, y: 30 }, { x: 2, y: 10 }, { x: 3, y: 5 }, { x: 4, y: 8 }, { x: 5, y: 15 }, { x: 6, y: 10 }];

        dataObj[0].values = formatted;

        return dataObj;
    }

    render() {
        return (
            <Modal show = {this.props.show} title = 'Quicklook'>
                <LineChart
                    ref = { function(node) { this.el = node; }.bind(this) }
                    legend = {false}
                    data = {this.data}
                    width = {this.width}
                    height = {this.height}
                    title = {this.props.title}
                    hoverAnimation = {false}
                    yAxisLabel = {this.props.ylabel}
                    xAxisLabel = {this.props.xlabel}
                    viewBoxObject={{
                        x: 0,
                        y: 0,
                        width: this.props.graphWidth,
                        height: this.props.graphHeight
                    }}
                    gridHorizontal = {this.props.grid}
                    gridVerical = {this.props.grid}
                />
                <Button onClick = {this.saveMe}>
                    Save
                </Button>
            </Modal>
        );
    }
}

Quicklook.defaultProps = {
    grid: true,
    show: true,
    width: '100%',
    height: '100%',
    graphWidth: 640,
    graphHeight: 480,
    watermarkText: 'https://promis.ikd.kiev.ua',
    title: 'Quicklook description',
    xlabel: 'x axis label',
    ylabel: 'y axis label'
}