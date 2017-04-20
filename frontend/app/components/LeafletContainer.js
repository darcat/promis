var React = require('react');

class LeafletContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var zoom = this.props.options.zoom;

        return (
            <div>hello i'm leaflet <div>my zoom is {zoom}</div></div>

        )
    }
}

module.exports = LeafletContainer;