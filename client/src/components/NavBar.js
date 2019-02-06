import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Searchbar from './NavSearchbar';

class UserNav extends Component {
  render() {
    const user = this.props.user;
    return user ? (
      <ul className="navbar-nav">
        <li className="nav-item dropdown">
          <button className="nav-link dropdown-toggle btn btn-link" id="accountDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {user.displayname}
          </button>
          <div className="dropdown-menu dropdown-menu-right" aria-labelledby="accountDropdown">
            <Link to={"/profile/" + user.username} className="dropdown-item" onClick={(e) => this.props.setCollapse(false)}>Profile</Link>
            <Link to="/settings" className="dropdown-item" onClick={(e) => this.props.setCollapse(false)}>Settings</Link>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item btn btn-link" onClick={(e) => {
              this.props.logout();
              this.props.setCollapse(false);
            }}>Log out</button>
          </div>
        </li>
      </ul>
    ) : (
      <ul className="navbar-nav">
        <li className={'nav-item' + (window.location.pathname === '/login' ? ' active' : '')}>
          <Link to="/login" className="nav-link" onClick={(e) => this.props.setCollapse(false)}>Log in</Link>
        </li>
        <li className={'nav-item' + (window.location.pathname === '/signup' ? ' active' : '')}>
          <Link to="/signup" className="nav-link" onClick={(e) => this.props.setCollapse(false)}>Sign up</Link>
        </li>
      </ul>
    )
  }
}

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseShow: false
    };
    this.logout = this.logout.bind(this);
    this.setCollapse = this.setCollapse.bind(this);
  }

  setCollapse(show) {
    this.setState({
      collapseShow: show
    });
  }

  logout() {
    fetch('/logout?csrfToken=' + this.props.csrfToken, {
      method: 'GET',
      credentials: 'include'
    }).then((res) => {
      this.props.authenticate(); // Reauthenticate (will fail if logout successful)
      // window.location.reload(); // Force page reload
    }).catch((err) => {
      console.log('Error logging out user.');
      console.log(err);
    });
  }

  render() {
    const { collapseShow } = this.state;
    const user = this.props.user;
    // const user = {
    //   username: 'fair',
    //   displayname: 'DrFair'
    // }
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light" >
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img src="/favicon.ico" width="30" height="30" className="d-inline-block align-top" alt="" />
            <span> MyWatchlist</span>
          </Link>

          <button
            className="navbar-toggler"
            onClick={(e) => {
              this.setState({
                collapseShow: !this.state.collapseShow
              });
            }}
            aria-controls="navbarCollapseContent"
            aria-expanded={this.state.collapseShow ? 'true' : 'false'}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={'collapse navbar-collapse' + (collapseShow ? ' show' : '')} id="navbarCollapseContent">
            <ul className="navbar-nav" style={{flexGrow: '1'}}>
              <li className={'nav-item' + (window.location.pathname === '/' ? ' active' : '')}>
                <Link to="/" className="nav-link" onClick={(e) => this.setCollapse(false)}>Home</Link>
              </li>
              <li className={'nav-item' + (window.location.pathname === '/about' ? ' active' : '')}>
                <Link to="/about" className="nav-link" onClick={(e) => this.setCollapse(false)}>About</Link>
              </li>
              <li className="nav-item w-100">
                <Searchbar route={this.props.route} csrfToken={this.props.csrfToken} search="" setCollapse={this.setCollapse} />
              </li>
            </ul>
            <UserNav setCollapse={this.setCollapse} logout={this.logout} user={user}/>
          </div>
        </div>
      </nav>
    )
  }
}

export default Navbar;
