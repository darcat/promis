import React, { Component } from 'react';
import { Button, Glyphicon, FormGroup } from 'react-bootstrap';

export default class SearchForm extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <FormGroup>
                    <Button>
                        <Glyphicon glyph = 'search' /> Search
                    </Button>
                </FormGroup>
            </div>
        )
    }
}