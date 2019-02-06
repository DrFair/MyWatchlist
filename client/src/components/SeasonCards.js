import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class SeasonCard extends Component {
  render() {
    const { season, showID } = this.props;
    const seasonName = season.name ? season.name : 'Season ' + season.season_number;
    const text = (season.air_date ? new Date(season.air_date).getUTCFullYear() + ' | ' : '') + season.episode_count + ' episodes'
    return (
      <Link to={'/show/' + showID + '/season/' + season.season_number} className="card poster-card">
        <img className="card-img-top" src={season.poster_url} alt="" />
        <h5 className="card-title" title={seasonName}>{seasonName}</h5>
        <p className="card-text" title={text}>{text}</p>
      </Link>
    )
  }
}

class SeasonCards extends Component {
  render() {
    return (
      <div className="card-div d-flex flex-row">
        <div className="card-wrapper">
          {this.props.seasons.map((season) => {
            return <SeasonCard season={season} showID={this.props.showID} key={season.id} />
          })}
          {this.props.expandSeasons ? (
            <button
              className="card-load btn btn-light"
              onClick={this.props.expandSeasons}
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          ) : null}
          <div className="card-fill"></div>
        </div>
      </div>
    )
  }
}

export default SeasonCards;
