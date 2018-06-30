import axios from 'axios';
import 'bootstrap';
import React from 'react';
import { render } from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      pw: '',
    };
  }

  componentDidMount() {
    this.handleLogin();
  }

  handleLogin() {
    const { pw } = this.state;
    const url = 'http://localhost:3000/login'; // TODO: Fix URL.
    const body = { pw };
    const config = {
      validateStatus: sc => sc >= 200 && sc < 500,
    };
    axios.post(url, body, config)
      .then((res) => {
        console.log(res.data);
        if (res.status === 200 && res.data === true) {
          this.setState({
            loggedIn: true,
          });
        }
      })
      .catch((e) => {
        alert('Network error.'); // TODO: Fix; don't use alert.
      });
  }

  handlePasswordInput(e) {
    this.setState({
      pw: e.target.value,
    });
  }

  render() {
    const { loggedIn } = this.state;
    return (
      <div>
        <div>
          <div className="jumbotron">
            <h1>Panopticat</h1>
          </div>
        </div>
        {
          !loggedIn &&
            <div className="input-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                aria-label="Password"
                aria-describedby="basic-addon2"
                value={this.state.pw}
                onChange={e => this.handlePasswordInput(e)}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => this.handleLogin()}
                >
                    Log In
                </button>
              </div>
            </div>
          }
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
