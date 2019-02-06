import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';

class SignupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signupError: null,
      signupSuccess: false
    };
    this.usernameElement = React.createRef();
    this.passwordElement = React.createRef();
    this.passwordConfirmElement = React.createRef();
    this.emailElement = React.createRef();
  }

  signup(data) {
    fetch('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {"Content-Type": "application/json"}
    }).then((res) => {
      if (res.status === 200) { // Success
        // Authenticate then
        console.log('Successfully signed up!');
        this.setState({
          signupSuccess: true
        });
        // window.location.reload(); // Force page reload
      } else if (res.status === 400) {
        res.json().then((data) => this.setState({
          signupError: data.error
        }));
      } else {
        this.setState({ signupError: 'Unknown signup error, please try again' });
        console.log('Failed signup:', res);
      }
    }).catch((err) => {
      console.log('Error signing up:', err);
    });
  }


  render() {
    const { signupError } = this.state;
    if (this.props.user) return <Redirect to="/" />
    return this.state.signupSuccess ? (
      <div className="col-md-6">
        <h3 className="text-center page-header">Sign up complete</h3>
        <p className="text-center">
          Sign up successfully completed.
          <br />
          <Link to="/login">Go to log in page</Link>
        </p>
      </div>
    ) : (
      <div className="col-md-6">
        <h3 className="text-center page-header">Sign up</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const pass = this.passwordElement.current.value;
            const passConfirm = this.passwordConfirmElement.current.value;
            // Clear password inputs
            this.passwordElement.current.value = '';
            this.passwordConfirmElement.current.value = '';
            this.signup({
              username: this.usernameElement.current.value,
              password: pass,
              passwordConfirm: passConfirm,
              email: this.emailElement.current.value,
              csrfToken: this.props.csrfToken
            });
          }}
        >
          <div className="form-group">
            <label htmlFor="usernameInput">Username</label>
            <input
              id="usernameInput"
              className="form-control"
              ref={this.usernameElement}
              type="text"
              name="username"
              placeholder="Username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="passwordInput">Password</label>
            <input
              id="passwordInput"
              className="form-control"
              ref={this.passwordElement}
              type="password"
              name="password"
              placeholder="Password"
            />
            <input
              className="form-control mt-2"
              ref={this.passwordConfirmElement}
              type="password"
              name="passwordConfirm"
              placeholder="Confirm password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="emailInput">Email</label>
            <input
              id="emailInput"
              className="form-control mt-2"
              ref={this.emailElement}
              type="email"
              name="email"
              placeholder="Email"
            />
            <small className="form-text text-muted">Used for account retrieval and confirmation.</small>
          </div>
          <button type="submit" className="btn btn-primary">
            Sign up
          </button>
          <span
            style={{
              color: '#F55',
              fontWeight: 'bold'
            }}
          >
            {signupError || ''}
          </span>

        </form>
      </div>
    )
  }
}

export default SignupForm;
