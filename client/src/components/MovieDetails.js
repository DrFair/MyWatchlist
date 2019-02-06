import React, { Component } from 'react';
import CastCards from './CastCards';
import './MovieDetails.css';

class MovieDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      details: null,
      loadingCast: null,
      error: null
    }
    this.updateDetails = this.updateDetails.bind(this);
    this.expandCast = this.expandCast.bind(this);
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
    const fetchURL = '/api/browse/movie/' + this.props.route.match.params.id + urlQuery;
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

  expandCast(event) {
    if (this.state.loadingCast) return; // Already loading
    this.setState({
      loadingCast: true
    });
    const urlQuery = '?csrfToken=' + this.props.csrfToken + '&from=' + this.state.details.credits.cast.length;
    const fetchURL = '/api/browse/movie/' + this.props.route.match.params.id + '/cast' + urlQuery;
    fetch(fetchURL, {
      method: 'GET',
      credentials: 'include'
    }).then((res) => {
      res.json().then((data) => {
        // This is a kinda bad way of getting an immutable state.details
        const details = JSON.parse(JSON.stringify(this.state.details));
        details.credits.cast = details.credits.cast.concat(data.cast.cast);
        this.setState({
          loadingCast: false,
          details: details
        });
      }).catch((err) => {
        console.log('Error parsing expand cast');
        console.log(err);
        this.setState({
          loadingCast: false
        });
      });
    }).catch((err) => {
      console.log('Error fetching expand cast');
      console.log(err);
      this.setState({
        loadingCast: false
      });
    });
  }

  render() {
    const { loading, details, error } = this.state;
    const runTimeHours = details ? Math.floor(details.runtime / 60) : null;
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
            <img className="movie-poster" src={details.poster_url} alt="" />
          </div>
          <div className="col-md-8 col-7">
            <div className="row">
              <h3>{details.title} <small className="title-note">({new Date(details.release_date).getFullYear()})</small></h3>
              <p>{details.overview}</p>
            </div>
            {/* On bigger devices */}
            <div className="row justify-content-center d-none d-md-flex">
              <h5 className="p-2 col-4 text-center"><small className="overview-note">{details.vote_count} votes</small><br/>{details.vote_average.toFixed(1)} <i className="fas fa-star"></i></h5>
              <h5 className="p-2 col-4 text-center"><small className="overview-note">Runtime</small><br/>{details.runtime} min</h5>
              <h5 className="p-2 col-4 text-center"><small className="overview-note">Status</small><br/>{details.status}</h5>
              <h5 className="p-2 col-4 text-center"><small className="overview-note">Budget</small><br/>${details.budget.toLocaleString()}</h5>
              <h5 className="p-2 col-4 text-center"><small className="overview-note">Revenue</small><br/>${details.revenue.toLocaleString()}</h5>
            </div>
          </div>
          {/* On small devices */}
          <div className="row justify-content-center d-flex d-md-none w-100">
            <h5 className="p-2 col-6 text-center"><small className="overview-note">{details.vote_count} votes</small><br/>{details.vote_average.toFixed(1)} <i className="fas fa-star"></i></h5>
            <h5 className="p-2 col-6 text-center"><small className="overview-note">Runtime</small><br/>{details.runtime} min</h5>
          </div>
          <div className="row justify-content-center w-100">
            {details.homepage ? (
              <h5 className="p-2 col-4 text-center"><a target="_blank" rel="noopener noreferrer" href={details.homepage}>Official site</a></h5>
            ) : null}
            <h5 className="p-2 col-4 text-center"><a target="_blank" rel="noopener noreferrer" href={'https://www.imdb.com/title/' + details.imdb_id}>View on IMDB</a></h5>
            <h5 className="p-2 col-4 text-center"><a target="_blank" rel="noopener noreferrer" href={'https://www.themoviedb.org/movie/' + details.id}>View on TMDB</a></h5>
          </div>
        </div>
        <div className="row-divider"></div>
        <div className="row">
          <h4 className="ml-4 w-100">Cast</h4>
          {details.credits.totalCast > 0 ? (
            <CastCards cast={details.credits.cast} expandCast={details.credits.cast.length >= details.credits.totalCast ? null : this.expandCast} />
          ) : (
            <h5 className="ml-4 w-100">No creditted cast</h5>
          )}
        </div>
        <div className="row-divider"></div>
        <div className="row">
          <h4 className="ml-4 w-100">Details</h4>
          <table className="details w-100">
            <tbody>
              <tr>
                <td>Status:</td>
                <td>{details.status}</td>
              </tr>
              <tr>
                <td>Runtime:</td>
                <td>{(runTimeHours > 0 ? runTimeHours + 'h ' : '') + (details.runtime % 60) + 'm'}</td>
              </tr>
              {details.genres.length > 0 ? (
                <tr>
                  <td>Genres:</td>
                  <td>{details.genres.map((e) => e.name).join(' | ')}</td>
                </tr>
              ) : null}
              <tr>
                <td>Release date:</td>
                <td>{details.release_date}</td>
              </tr>
              <tr>
                <td>Budget:</td>
                <td>${details.budget.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Revenue:</td>
                <td>${details.revenue.toLocaleString()}</td>
              </tr>
              {details.production_companies.length > 0 ? (
                <tr>
                  <td>Production:</td>
                  <td>{details.production_companies.map((e) => e.name).join(' | ')}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    ) : null
  }
}

export default MovieDetails;
