import React, { Component } from 'react';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      profile: null,
      error: null
    }
  }

  componentDidMount() {
    this.updateUser();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.route.match.params.user !== this.props.route.match.params.user) {
      this.updateUser();
    }
  }

  updateUser() {
    if (this.props.route.match.params.user) {
      // If same user is already loaded, don't update
      if (this.state.profile !== null && this.state.profile.username === this.props.route.match.params.user) return;
      this.setState({
        loading: true
      });
      fetch('/api/browse/profile/' + this.props.route.match.params.user + '?csrfToken=' + this.props.csrfToken, {
        method: 'GET',
        credentials: 'include'
      }).then((res) => {
        res.json().then((data) => {
          if (data.error) {
            this.setState({
              loading: false,
              profile: null,
              error: data.error,
            });
          } else {
            this.setState({
              loading: false,
              profile: data,
              error: null
            });
          }
        }).catch((err) => {
          console.log('Error parsing profile data');
        })
      }).catch((err) => {
        console.log('Error getting profile data', err);
      });
    }
  }

  render() {
    if (this.state.loading) return <h3 className="text-center">...</h3>;
    if (this.state.error) return (
      <div className="col-md-6">
        <h3 className="text-center page-header">{this.state.error}</h3>
      </div>
    )
    return this.state.profile ? (
      <div className="col-md-6">
        <h3 className="text-center page-header">{this.state.profile.displayname}</h3>
      </div>
    ) : (
      <div className="col-md-6">
        <h3 className="text-center page-header">Profile not found</h3>
      </div>
    )
  }
}

export default Profile;
