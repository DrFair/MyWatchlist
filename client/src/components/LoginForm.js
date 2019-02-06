import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.usernameElement = React.createRef();
    this.passwordElement = React.createRef();
    this.state = {
      loginError: null,
      redirect: false
    };
    this.login = this.login.bind(this);
  }

  login(data) {
    this.setState({ loginError: null });
    fetch('/login', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {"Content-Type": "application/json"}
    }).then((res) => {
      if (res.status === 200) { // Success
        // Authenticate then
        this.props.authenticate();
        // window.location.reload(); // Force page reload
        this.setState({
          redirect: true
        });
      } else if (res.status === 401) {
        res.json().then((data) => {
          this.setState({
            loginError: data.error
          });
        });
      } else {
        this.setState({ loginError: 'Unknown login error, please try again' });
        console.log('Failed login:', res);
      }
    }).catch((err) => {
      console.log('Error logging in:', err);
    });
  }

  render() {
    let { loginError, redirect } = this.state;
    if (redirect) return <Redirect to="/" />
    if (this.props.user) return <Redirect to="/" />
    return (
      <div className="col-md-6">
        <h3 className="text-center page-header">Log in</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Store temp password
            const pass = this.passwordElement.current.value;
            this.passwordElement.current.value  = ''; // Clear password
            this.login({
              username: this.usernameElement.current.value,
              password: pass,
              csrfToken: this.props.csrfToken
            });
          }}
        >
          <div className="form-group">
            <label htmlFor="usernameInput">Username</label>
            <input
              ref={this.usernameElement}
              id="usernameInput"
              className="form-control"
              type="text"
              name="username"
              placeholder="Username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="passwordInput">Password</label>
            <input
              ref={this.passwordElement}
              id="passwordInput"
              className="form-control"
              type="password"
              name="password"
              placeholder="Password"
            />
          </div>
          <button type="submit" className="btn btn-primary">Log in</button>
          <span
            style={{
              color: '#F55',
              fontWeight: 'bold'
            }}
          >
            {loginError || ''}
          </span>
          <p><Link to="/forgotpassword">Forgot password?</Link></p>
        </form>
      </div>
    )
  }
}

export default LoginForm;
