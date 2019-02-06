import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

class DisplayNameForm extends Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.state = {
      error: null,
      errorColor: '#F55'
    }
    this.submit = this.submit.bind(this);
  }

  submit(event) {
    event.preventDefault();
    if (!this.input.current.value) return;
    this.setState({
      error: null,
      success: null
    });
    fetch('/api/account/name/change', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: this.props.csrfToken,
        name: this.input.current.value
      }),
      credentials: 'include',
      headers: {"Content-Type": "application/json"}
    }).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          this.setState({
            error: data.error,
            errorColor: '#F55'
          });
        } else {
          this.setState({
            error: data.success,
            errorColor: '#2A2'
          });
          this.props.authenticate();
        }
      }).catch((err) => {
        this.setState({
          error: 'Unknown error submitting name change',
          errorColor: '#F55'
        });
        console.log('Error parsing name change response', err);
      })
    }).catch((err) => {
      this.setState({
        error: 'Unknown error submitting name change',
        errorColor: '#F55'
      });
      console.log('Error submitting name change', err);
    });
    // Clear input
    this.input.current.value = '';
  }

  render() {
    return (
      <div>
        <h5>Change display name <small className="float-right">Username: {this.props.user.username}</small></h5>
        <form onSubmit={this.submit}>
          <div className="form-group">
            <input
              ref={this.input}
              type="text"
              className="form-control"
              name="name"
              autoCorrect="off"
              autofill="off"
              autoComplete="off"
              spellCheck="false"
              placeholder="Display name"
              defaultValue={this.props.user.displayname}
            />
            <small className="form-text" style={{ color: this.state.errorColor, fontWeight: 'bold'}}>{this.state.error}</small>
          </div>
          <button type="submit" className="btn btn-primary">Change display name</button>
        </form>
      </div>
    );
  }
}

class PasswordChange extends Component {
  constructor(props) {
    super(props);
    this.currentPasswordInput = React.createRef();
    this.passwordInput = React.createRef();
    this.passwordConfirmInput = React.createRef();
    this.state = {
      error: null,
      errorColor: '#F55'
    }
    this.submit = this.submit.bind(this);
  }

  submit(event) {
    event.preventDefault();
    if (!this.currentPasswordInput.current.value) {
      this.setState({
        error: 'Missing current password',
        errorColor: '#F55'
      });
      return;
    }
    if (!this.passwordInput.current.value || !this.passwordConfirmInput.current.value) {
      this.setState({
        error: 'Missing new password',
        errorColor: '#F55'
      });
      return;
    }
    fetch('/api/account/password/change', {
      method: 'POST',
      body: JSON.stringify({
        csrfToken: this.props.csrfToken,
        currentPassword: this.currentPasswordInput.current.value,
        password: this.passwordInput.current.value,
        passwordConfirm: this.passwordConfirmInput.current.value,
      }),
      credentials: 'include',
      headers: {"Content-Type": "application/json"}
    }).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          this.setState({
            error: data.error,
            errorColor: '#F55'
          });
        } else {
          this.setState({
            error: data.success,
            errorColor: '#2A2'
          });
        }
      }).catch((err) => {
        this.setState({
          error: 'Unknown error submitting password change',
          errorColor: '#F55'
        });
        console.log('Error parsing password change response', err);
      })
    }).catch((err) => {
      this.setState({
        error: 'Unknown error submitting password change',
        errorColor: '#F55'
      });
      console.log('Error submitting password change', err);
    });
    // Clear input
    this.currentPasswordInput.current.value = '';
    this.passwordInput.current.value = '';
    this.passwordConfirmInput.current.value = '';
  }

  render() {
    return (
        <div>
          <h5>Change password</h5>
          <form onSubmit={this.submit}>
            <div className="form-group">
              <label htmlFor="currentPasswordInput">Current password</label>
              <input
                ref={this.currentPasswordInput}
                type="password"
                className="form-control"
                id="currentPasswordInput"
                name="currentPassword"
                placeholder="Current password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="passwordInput">New password</label>
              <input
                ref={this.passwordInput}
                type="password"
                className="form-control"
                id="passwordInput"
                name="password"
                placeholder="New password"
              />
              <input
                ref={this.passwordConfirmInput}
                type="password"
                className="form-control mt-2"
                id="passwordConfirmInput"
                name="passwordConfirm"
                placeholder="Confirm new password"
              />
              <small className="form-text" style={{ color: this.state.errorColor, fontWeight: 'bold'}}>{this.state.error}</small>
            </div>
            <button type="submit" className="btn btn-primary">Change password</button>
          </form>
        </div>
    );
  }
}

class AccountSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorColor: '#F55'
    }
  }

  render() {
    if (this.props.user === null) return <Redirect to="/" />;
    return (
      <div className="col-md-6">
        <h3 className="text-center page-header">Account settings</h3>
        {this.state.error ? (
          <span style={{ color: this.state.errorColor, fontWeight: 'bold'}}>{this.state.error}</span>
        ) : null}
        <DisplayNameForm authenticate={this.props.authenticate} csrfToken={this.props.csrfToken} user={this.props.user} />
        <div style={{ marginTop: 30 }}></div>
        <PasswordChange csrfToken={this.props.csrfToken} user={this.props.user} />
        <h3 className="text-center page-header">Privacy settings</h3>
        <p className="text-center">Nothing here at the moment</p>
      </div>
    )
  }
}

export default AccountSettings;
