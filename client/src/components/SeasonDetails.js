import React, { Component } from 'react';
import AnimateHeight from 'react-animate-height';
import { Link } from 'react-router-dom';
import CastCards from './CastCards';
import './SeasonDetails.css';

class EpisodeContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  render() {
    const { episode } = this.props;
    return (
      <AnimateHeight
        id={'e' + episode.episode_number}
        className="episode-container"
        duration={300}
        height={this.state.expanded ? 'auto' : 100}
      >
        <div className="container p-0 m-0">
          <div className="episode-content">
            <div className="episode-still-wrapper">
              <img className="episode-still" src={episode.still_url} alt=""/>
            </div>
            <div className="episode-summary p-2">
              <h4>
                <a
                  className="episode-expand-link" href={'#e' + episode.episode_number}
                  onClick={(e) => {
                    e.preventDefault();
                    this.setState({
                      expanded: !this.state.expanded
                    });
                  }}
                >
                  {episode.name}
                </a> <small className="episode-title-note float-right">E{('0' + episode.episode_number).slice(-2)} - {episode.air_date}</small>
              </h4>
              <p>{episode.overview}</p>
            </div>
          </div>
          <div className="row">
            <div className="episode-content-divider"></div>
            <div className="col-12">
              <h5>More info coming</h5>
              {
                // Examples on info: Guest cast, rating
              }

            </div>
          </div>
        </div>
      </AnimateHeight>
    )
  }
}

class SeasonDetails extends Component {
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
    const fetchURL = '/api/browse/show/' + this.props.route.match.params.id + '/season/' + this.props.route.match.params.season + urlQuery;
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
    const fetchURL = '/api/browse/show/' + this.props.route.match.params.id + '/season/' + this.props.route.match.params.season + '/cast' + urlQuery;
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
            <img className="season-poster" src={details.poster_url} alt=""/>
          </div>
          <div className="col-md-8 col-7">
            <div className="row d-block">
              <Link className="back-link" to={'/show/' + details.showID}><i className="fas fa-arrow-left"></i> Back to show</Link>
              <h3>{details.name} <small className="title-note">{details.air_date ? '(' + new Date(details.air_date).getFullYear() + ')' : null}</small></h3>
              <p>{details.overview}</p>
            </div>
            <div className="row justify-content-center d-flex">
              <h5 className="p-2 col-4 text-center"><small className="overview-note">Season</small><br/>{details.season_number}</h5>
              <h5 className="p-2 col-4 text-center"><small className="overview-note">Episodes</small><br/>{details.episodes.length}</h5>
            </div>
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
          <h4 className="ml-4 w-100">Episodes</h4>
          {details.episodes.map((episode) => {
            return <EpisodeContainer key={episode.id} episode={episode} />
          })}
        </div>
      </div>
    ) : null
  }
}

export default SeasonDetails;
