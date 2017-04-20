var React = require('react');

require('cesium/Source/Widgets/widgets.css');

class CesiumContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>hello i'm cesium</div>
        )
    }
}

module.exports = CesiumContainer;