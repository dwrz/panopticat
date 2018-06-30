import axios from 'axios';
import 'bootstrap';
import React from 'react';
import { render } from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pw: '',
    };
  }

  render() {
    return (
      <div>
        <div className="jumbotron">
          <h1>Panopticat</h1>
        </div>
        <div>
          <div className="form-group mx-sm-3 mb-2">
            <label htmlFor="inputPassword2" className="sr-only">Password</label>
            <input type="password" className="form-control" id="password" placeholder="Password" />
          </div>
          <button type="submit" className="btn btn-primary mb-2">Confirm identity</button>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
