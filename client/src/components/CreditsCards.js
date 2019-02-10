import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class CreditCard extends Component {
  render() {
    const { credit } = this.props;
    let link = '#';
    if (credit.media_type === 'tv') link = '/show/' + credit.id;
    if (credit.media_type === 'movie') link = '/movie/' + credit.id;
    const title = credit.name || credit.title || 'Uknown title';
    const creditsJoin = credit.credits.length > 0 ? credit.credits.join(', ') : '';
    return (
      <Link to={link} className="card poster-card">
        <img className="card-img-top" src={credit.poster_path} alt="" />
        <h5 className="card-title" title={title}>{title}</h5>
        <p className="card-text" title={creditsJoin}>{creditsJoin}</p>
      </Link>
    )
  }
}

class CreditsCards extends Component {
  render() {
    return (
      <div className="card-div d-flex flex-row">
        <div className="card-wrapper">
          {this.props.credits.map((credit) => {
            return <CreditCard credit={credit} key={credit.id} />
          })}
          {this.props.expandCredits ? (
            <button
              className="card-load btn btn-light"
              onClick={this.props.expandCredits}
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

export default CreditsCards;
