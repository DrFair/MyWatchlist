import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Navbar from './components/NavBar';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import AccountSettings from './components/AccountSettings';
import Search from './components/Search';
import MovieDetails from './components/MovieDetails';
import ShowDetails from './components/ShowDetails';
import SeasonDetails from './components/SeasonDetails';
import PersonDetails from './components/PersonDetails';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingAuth: true,
      loadingCSRF: true,
      csrfToken: null,
      user: null
    };
    this.getCSRF = this.getCSRF.bind(this);
    this.authenticate = this.authenticate.bind(this);
  }

  // Login on first mount
  componentDidMount() {
    this.authenticate();
    this.getCSRF();
  }

  getCSRF() {
    fetch('/gettoken', {
      method: 'GET',
      credentials: 'include'
    }).then((res) => {
      if (res.status === 200) { // Success
        // console.log('Got CSRF Token!');
        res.json().then((data) => {
          this.setState({
            loadingCSRF: false,
            csrfToken: data.token
          });
          this.setState(data);
        }).catch((err) => {
          this.setState({
            loadingCSRF: false
          });
        });
      } else {
        this.setState({
          loadingCSRF: false
        });
        console.log('Failed CSRF token:', res);
      }
    }).catch((err) => {
      this.setState({
        loadingCSRF: false
      });
      console.log('Error signing up:', err);
    });
  }

  authenticate() {
    fetch('/user', {
      credentials: 'include'
    }).then((res) => {
      if (res.status === 200) {
        // console.log('Authenticate OK');
        res.json().then((data) => {
          this.setState({
            loadingAuth: false,
            user: data.user
          });
          this.forceUpdate();
        }).catch((err) => {
          this.setState({
            loadingAuth: false,
            user: null
          });
          console.log(err);
        });
      } else {
        // console.log('Authenticate FAIL');
        this.setState({
          loadingAuth: false,
          user: null
        });
      }
    }).catch((err) => {
      this.setState({
        loadingAuth: false
      });
      console.log('Error fetching authorized user.');
      console.log(err);
    });
  }

  render() {
     // Wait for loading complete
    if (this.state.loadingAuth || this.state.loadingCSRF) return null;
    const props = {
      csrfToken: this.state.csrfToken,
      authenticate: this.authenticate,
      user: this.state.user
    };
    return (
      <Router>
        <div>
          <Route path='/' render={(route) => (
            <Navbar route={route} {...props} />
          )} />
          <div className="container" style={{ marginBottom: 50 }}>
            <div className="row justify-content-md-center">
              <Switch>
                <Route exact path="/" render={() => (
                  <div className="col-md-6">
                    <h3 className="text-center page-header">Home</h3>
                    <p className="text-center">Nothing here at the moment</p>
                  </div>
                )} />
                <Route exact path="/login" render={(route) => (
                  <LoginForm route={route} {...props} />
                )} />
                <Route exact path="/signup" render={(route) => (
                  <SignupForm route={route} {...props} />
                )} />
                <Route exact path="/forgotpassword" render={(route) => (
                  <ForgotPassword route={route} {...props} />
                )}/>
                <Route exact path="/resetpassword" render={(route) => (
                  <ResetPassword route={route} {...props} />
                )}/>
                <Route exact path="/profile/:user" render={(route) => (
                  <Profile route={route} {...props} />
                )}/>
                <Route exact path="/settings" render={(route) => (
                  <AccountSettings route={route} {...props} />
                )}/>
                <Route exact path="/search/:type" render={(route) => (
                  <Search route={route} {...props} />
                )}/>
                <Route exact path="/movie/:id" render={(route) => (
                  <MovieDetails route={route} {...props} />
                )}/>
                <Route exact path="/show/:id" render={(route) => (
                  <ShowDetails route={route} {...props} />
                )}/>
                <Route exact path="/show/:id/season/:season" render={(route) => (
                  <SeasonDetails route={route} {...props} />
                )}/>
                <Route exact path="/person/:id" render={(route) => (
                  <PersonDetails route={route} {...props} />
                )}/>
                <Route component={Route404} />
              </Switch>
            </div>
          </div>
        </div>
      </Router>
    )
  }
}

function Route404() {
  return (
    <div className="col-md-6">
      <h3 className="text-center page-header">Page not found</h3>
      <p className="text-center">
        Looks like you got off-track.
        <br/>
        <Link to="/">Go to home page</Link>
      </p>
    </div>
  )
}

export default Home;
