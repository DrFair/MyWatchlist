import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom'
import QueryString from 'query-string';

class PasswordReset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resetError: null,
      singleError: false,
      resetSuccess: false
    };
    this.requestReset = this.requestReset.bind(this);
    this.passwordInput = React.createRef();
    this.passwordInputConfirm = React.createRef();
  }

  requestReset(data) {
    if (!data) return;
    fetch('/api/account/resetpassword', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(data),
      headers: {"Content-Type": "application/json"}
    }).then((res) => {
      res.json().then((data) => {
        if (data.success) {
          this.setState({
            resetSuccess: true
          });
        } else {
          this.setState({
            resetError: data.error,
            singleError: data.single
          });
        }
      }).catch((err) => {
        console.log('Error parsing password reset');
        console.log(err);
        this.setState({
          resetError: 'Unknown error resetting password'
        });
      });
    }).catch((err) => {
      console.log('Error resetting password');
      console.log(err);
      this.setState({
        resetError: 'Unknown error resetting password'
      });
    });
  }

  render() {
    // console.log(QueryString.parse(this.props.route.location.search));
    if (this.props.user) return <Redirect to="/" />;
    const query = QueryString.parse(this.props.route.location.search);
    if (!query.code) return <Redirect to="/forgotpassword" />;
    if (this.state.singleError && this.state.resetError) {
      return (
        <div>
          <h3 className="text-center page-header">Password reset</h3>
          <p className="text-center">{this.state.resetError}</p>
        </div>
      )
    }

    return this.state.resetSuccess ? (
      <div className="col-md-6">
        <h3 className="text-center page-header">Password reset</h3>
        <p className="text-center">
          Password reset completed successfully!
          <br />
          <Link to="/login">Go to log in page</Link>
        </p>
      </div>
    ) : (
      <div className="col-md-6">
        <h3 className="text-center page-header">Password reset</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.requestReset({
              csrfToken: this.props.csrfToken,
              code: query.code,
              password: this.passwordInput.current.value,
              passwordConfirm: this.passwordInputConfirm.current.value
            })
          }}
        >
          <div className="form-group">
            <label htmlFor="passwordInput">New password</label>
            <input
              ref={this.passwordInput}
              type="password"
              className="form-control"
              name="password"
              id="passwordInput"
              placeholder="New password"
            />
            <label htmlFor="passwordInputConfirm">Confirm new password</label>
            <input
              ref={this.passwordInputConfirm}
              type="password"
              className="form-control"
              name="passwordConfirm"
              id="passwordInputConfirm"
              placeholder="Confirm new password"
            />
          </div>
          <button type="submit" className="btn btn-primary">Change password</button>
          <span style={{ color: '#F55', fontWeight: 'bold'}}>{this.state.resetError}</span>
        </form>
      </div>
    )
  }
}

export default PasswordReset;
