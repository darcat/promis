var React = require('react');
var Bootstrap = require('react-bootstrap');

var Row = Bootstrap.Row;
var Well = Bootstrap.Well;


var Nav = require('./Nav');
var Panel = require('./Panel');

class App extends React.Component {
    render() {
        return (
            <div>
                <Nav />
                <div>
                    <Well bsSize="large">
                        <h3>Ionosat PROMIS</h3>
                        <p>We are glad to welcome you on this page. Please use the filters below to refine your search</p>
                    </Well>
                    <Row>
                        <Panel>
                            <form class="form-horizontal">
                              <div class="form-group">
                                <div class = 'col-sm-2'>
                                  <label for="daterange" class="control-label">Interval</label>
                                </div>
                                <div class = 'col-sm-10'>
                                  <input type="text" class="form-control daterange" name="daterange" value="08/01/2011 - 09/30/2011" />
                                </div>
                              </div>
                              <div class="form-group">
                                <div class = 'col-sm-2'>
                                  <label class = 'control-label'>Input</label>
                                </div>
                                <div class = 'col-sm-10'>
                                  <input type="checkbox" data-toggle="toggle" class = 'loctoggler'
                                    data-on="<i class='glyphicon glyphicon-screenshot'></i> Use map" data-off="<i class='glyphicon glyphicon-list-alt'></i> Manual" />
                                </div>
                              </div>
                              <div class="form-group textlocation">
                                <div class = 'col-sm-2'>
                                  <label for="geoalt" class="control-label">Altitude</label>
                                </div>
                                <div class="col-sm-5">
                                  <div class = 'input-group'>
                                    <span class="input-group-addon" id="basic-addon1">From</span>
                                    <input class="form-control" type="number" aria-describedby="basic-addon1" value="400" id="geoalt1" />
                                  </div>
                                </div>
                                <div class="col-sm-5">
                                  <div class = 'input-group'>
                                    <span class='input-group-addon' id='basic-addon2'>To</span>
                                    <input class="form-control" type="number" aria-describedby="basic-addon2" value="440" id="geoalt2" />
                                  </div>
                                </div>
                              </div>
                              <div class="form-group textlocation">
                                <div class = 'col-sm-2'>
                                  <label for="geolat" class="control-label">Latitude</label>
                                </div>
                                <div class="col-sm-5">
                                  <div class = 'input-group'>
                                    <span class="input-group-addon" id="basic-addon3">From</span>
                                    <input class="form-control" type="number" aria-describedby="basic-addon3" value="8.407168" id="geolat1" />
                                  </div>
                                </div>
                                <div class="col-sm-5">
                                  <div class = 'input-group'>
                                    <span class='input-group-addon' id='basic-addon4'>To</span>
                                    <input class="form-control" type="number" aria-describedby="basic-addon4" value="5.441022" id="geolat2" />
                                  </div>
                                </div>
                              </div>
                              <div class="form-group textlocation">
                                <div class = 'col-sm-2'>
                                  <label for="geolon" class="control-label">Longtitude</label>
                                </div>
                                <div class="col-sm-5">
                                  <div class = 'input-group'>
                                    <span class="input-group-addon" id="basic-addon5">From</span>
                                    <input class="form-control" type="number" aria-describedby="basic-addon5" value="-65.214844" id="geolon1" />
                                  </div>
                                </div>
                                <div class="col-sm-5">
                                  <div class = 'input-group'>
                                    <span class='input-group-addon' id='basic-addon6'>To</span>
                                    <input class="form-control" type="number" aria-describedby="basic-addon6" value="-61.171875" id="geolon2" />
                                  </div>
                                </div>
                              </div>
                              <div class='form-group maplocation'>
                                <div class = 'col-sm-2'>
                                  <label class = 'control-label'>Selection</label>
                                </div>
                                <div class = 'col-sm-10'>
                                  <ul class = 'curselect'></ul>
                                </div>
                              </div>
                            </form>
                        </Panel>
                    </Row>
                </div>
            </div>
        )
    }
}

module.exports = App;
