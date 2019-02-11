import React, { Component } from 'react';
import CreditsCards from './CreditsCards';
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
      <div className="col-md-10">
        <div className="row mt-4">
          <div className="col-md-4 col-5 poster-div">
            <img className="person-poster" src={details.profile_url} alt="" />
          </div>
          <div className="col-md-8 col-7">
            <div className="row">
              <h3>{details.name}</h3>
            </div>
            <div className="row">
              <p>{details.biography ? details.biography : "No biography"}</p>
            </div>
          </div>
          <div className="row justify-content-center w-100">
            {details.homepage ? (
              <h5 className="p-2 col-4 text-center"><a target="_blank" rel="noopener noreferrer" href={details.homepage}>Official site</a></h5>
            ) : null}
            <h5 className="p-2 col-4 text-center"><a target="_blank" rel="noopener noreferrer" href={'https://www.imdb.com/name/' + details.imdb_id}>View on IMDB</a></h5>
            <h5 className="p-2 col-4 text-center"><a target="_blank" rel="noopener noreferrer" href={'https://www.themoviedb.org/person/' + details.id}>View on TMDB</a></h5>
          </div>
        </div>
        <div className="row-divider"></div>
        <div className="row">
          <h4 className="ml-4 w-100">Known credits</h4>
          {details.credits.length > 0 ? (
            <CreditsCards credits={details.credits} expandCredits={null} />
          ) : (
            <h5 className="ml-4 w-100">No known credits</h5>
          )}
        </div>
        <div className="row-divider"></div>
        <div className="row">
          <h4 className="ml-4 w-100">Details</h4>
          <table className="details w-100">
            <tbody>
              <tr>
                <td>Name:</td>
                <td>{details.name}</td>
              </tr>
              <tr>
                <td>Known for:</td>
                <td>{details.known_for_department}</td>
              </tr>
              {details.birthday ? (
                <tr>
                  <td>Birthday:</td>
                  <td>{details.birthday}</td>
                </tr>
              ) : null}
              {details.place_of_birth ? (
                <tr>
                  <td>Place of birth:</td>
                  <td>{details.place_of_birth}</td>
                </tr>
              ) : null}
              {details.deathday ? (
                <tr>
                  <td>Deathday:</td>
                  <td>{details.deathday}</td>
                </tr>
              ) : null}
              {details.gender ? (
                <tr>
                  <td>Gender:</td>
                  {details.gender === 1 ? (
                    <td>Female</td>
                  ) : details.gender === 2 ? (
                    <td>Male</td>
                  ) : (
                    <td>Unknown</td>
                  )}
                </tr>
              ) : null}
              {details.credits ? (
                <tr>
                  <td>Known credits:</td>
                  <td>{details.credits.length}</td>
                </tr>
              ) : null}
              {details.also_known_as && details.also_known_as.length > 0 ? (
                <tr>
                  <td>Also known as:</td>
                  <td>{details.also_known_as.join(' | ')}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    ) : null
  }
}

export default PersonDetails;
