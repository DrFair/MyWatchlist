import React, { Component } from 'react';
import './PersonDetails.css';

class PersonDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      details: null,
      error: null
    }
    this.updateDetails = this.updateDetails.bind(this);
  }

  componentDidMount() {
    this.updateDetails();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.route.match.params.id !== this.props.route.match.params.id) {
      this.updateDetails();
    }
  }

  updateDetails() {
    this.setState({
      loading: true,
      details: null,
      error: null
    });
    const urlQuery = '?csrfToken=' + this.props.csrfToken;
    const fetchURL = '/api/browse/person/' + this.props.route.match.params.id + urlQuery;
    fetch(fetchURL, {
      method: 'GET',
      credentials: 'include'
    }).then((res) => {
      res.json().then((data) => {
        console.log(data);
        if (data.error) {
          this.setState({
            loading: false,
            details: null,
            error: data.error
          });
        } else if (data.details) {
          this.setState({
            loading: false,
            details: data.details,
            error: null
          });
        } else {
          this.setState({
            loading: false,
            details: null,
            error: 'Unknown error fetching details'
          });
        }
      }).catch((err) => {
        this.setState({
          loading: false,
          details: null,
          error: 'Error parsing details'
        });
      })
    }).catch((err) => {
      this.setState({
        loading: false,
        details: null,
        error: 'Error fetching details'
      });
    });
  }

  render() {
    const { loading, details, error } = this.state;
    return loading ? (
      <div className="col-md-6">
        <h3 className="text-center">...</h3>
      </div>
    ) : error ? (
      <div className="col-md-6">
        <p className="text-center">{error}</p>
      </div>
    ) : details ? (
      <div className="col-md-6">
        <h3 className="text-center page-header">{details.name}</h3>
        <p className="text-center">Nothing here yet</p>
      </div>
    ) : null
  }
}

export default PersonDetails;
