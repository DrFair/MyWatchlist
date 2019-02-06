import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'

class PasswordReset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resetError: null,
      resetSuccess: false
    };
    this.requestReset = this.requestReset.bind(this);
    this.emailInput = React.createRef();
  }

  requestReset(email) {
    if (!email) return;
    fetch('/api/account/forgotpassword', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        csrfToken: this.props.csrfToken,
        email: email
      }),
      headers: {"Content-Type": "application/json"}
    }).then((res) => {
      res.json().then((data) => {
        if (data.success) {
          this.setState({
            resetSuccess: true
          });
        } else {
          this.setState({
            resetError: data.error
          });
        }
      })
    }).catch((err) => {
      console.log('Error requesting password reset', err);
    });
  }

  render() {
    if (this.props.user) return <Redirect to="/" />;
    return this.state.resetSuccess ? (
      <div className="col-md-6">
        <h3 className="text-center page-header">Password reset request sent</h3>
        <p className="text-center">Password reset request has been sent, please check your email.</p>
      </div>
    ) : (
      <div className="col-md-6">
        <h3 className="text-center page-header">Password reset</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.requestReset(this.emailInput.current.value)
          }}
        >
          <div className="form-group">
            <label htmlFor="emailInput">Email</label>
            <input
              ref={this.emailInput}
              type="email"
              className="form-control"
              id="emailInput"
              name="email"
              placeholder="Email"
            />
          </div>
          <button type="submit" className="btn btn-primary">Request reset</button>
          <span style={{ color: '#F55', fontWeight: 'bold'}}>{this.state.resetError}</span>
        </form>
      </div>
    )
  }
}

export default PasswordReset;
