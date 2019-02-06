import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class CastCard extends Component {
  render() {
    const { cast } = this.props;
    return (
      <Link to={'/person/' + cast.id} className="card poster-card">
        <img className="card-img-top" src={cast.profile_url} alt="" />
        <h5 className="card-title" title={cast.name}>{cast.name}</h5>
        <p className="card-text" title={cast.character}>{cast.character}</p>
      </Link>
    )
  }
}

class CastCards extends Component {
  render() {
    return (
      <div className="card-div d-flex flex-row">
        <div className="card-wrapper">
          {this.props.cast.map((cast) => {
            return <CastCard cast={cast} key={cast.id} />
          })}
          {this.props.expandCast ? (
            <button
              className="card-load btn btn-light"
              onClick={this.props.expandCast}
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

export default CastCards;
