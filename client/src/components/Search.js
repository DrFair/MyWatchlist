import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import QueryString from 'query-string';
import './Search.css';

class ResultsNav extends Component {
  render() {
    const { type, query, results } = this.props;
    const pageURL = '/search/' + type + (query ? '?q=' + query + '&page=' : '?page=');

    const pageNavs = [];
    pageNavs.push();
    pageNavs.push(<li key="prev" className={'page-item' + (results.page > 1 ? '' : ' disabled')}><Link className="page-link" to={pageURL + (results.page - 1)}>Previous</Link></li>);
    if (results.totalPages > 5) {
      let minPage = Math.max(1, results.page - 2);
      let maxPage = Math.min(results.totalPages, results.page + 2);
      if (results.page > 3) {
        minPage = Math.max(3, minPage);
        pageNavs.push(<li key="1" className="page-item d-none d-sm-block"><Link className="page-link" to={pageURL + 1}>1</Link></li>);
        pageNavs.push(<li key="2" className="page-item d-none d-sm-block"><Link className="page-link" to={pageURL + 2}>2</Link></li>);
        if (minPage - 1 !== 2) {
          pageNavs.push(<li key="morePrev" className="page-item d-none d-sm-block disabled"><Link className="page-link" to="#">...</Link></li>);
        }
      }
      if (results.page < results.totalPages - 2) {
        maxPage = Math.min(results.totalPages - 2, maxPage);
      }
      for (let i = minPage; i <= maxPage; i++) {
        pageNavs.push(<li key={i} className={'page-item' + (results.page === i ? ' active' : '')}><Link className="page-link" to={pageURL + i}>{i}</Link></li>);
      }
      if (results.page < results.totalPages - 2) {
        if (maxPage + 1 !== results.totalPages - 1) {
          pageNavs.push(<li key="moreNext" className="page-item d-none d-sm-block disabled"><Link className="page-link" to="#">...</Link></li>);
        }
        pageNavs.push(<li key={results.totalPages - 1} className="page-item d-none d-sm-block"><Link className="page-link" to={pageURL + (results.totalPages - 1)}>{results.totalPages - 1}</Link></li>);
        pageNavs.push(<li key={results.totalPages} className="page-item d-none d-sm-block"><Link className="page-link" to={pageURL + results.totalPages}>{results.totalPages}</Link></li>);
      }
    } else {
      for (let i = 1; i <= results.totalPages; i++) {
        pageNavs.push(<li key={i} className={'page-item' + (results.page === i ? ' active' : '')}><Link className="page-link" to={pageURL + i}>{i}</Link></li>);
      }
    }
    pageNavs.push(<li key="next" className={'page-item' + (results.page < results.totalPages ? '' : ' disabled')}><Link className="page-link" to={pageURL + (results.page + 1)}>Next</Link></li>);
    return (
      <nav>
        <ul className="pagination justify-content-md-center" style={{ marginTop: 30 }}>
          {pageNavs}
        </ul>
      </nav>
    )
  }
}

class MovieResult extends Component {
  render() {
    const { result, type } = this.props;
    return (
      <Link className="search-result-link" to={'/movie/' + result.id}>
        <div className="search-result d-flex flex-row">
          <div className="search-result-image">
            <img src={result.image_url} alt=""/>
          </div>
          <div className="search-result-content">
            <h5>
              {result.title + (result.year ? ' (' + result.year + ')' : '')}
              <small className="note"> {result.genres}</small>
              <span className="float-right">{result.vote_average.toFixed(1)} <i className="fas fa-star"></i></span><small className="note float-right" style={{ marginTop: 3, marginRight: 10}}>{type === 'all' ? 'Movie' : ''}</small>
            </h5>
            <p>{result.overview}</p>
          </div>
        </div>
      </Link>
    )
  }
}

class TVResult extends Component {
  render() {
    const { result, type } = this.props;
    return (
      <Link className="search-result-link" to={'/show/' + result.id}>
        <div className="search-result d-flex flex-row">
          <div className="search-result-image">
            <img src={result.image_url} alt=""/>
          </div>
          <div className="search-result-content">
            <h5>
              {result.name + (result.year ? ' (' + result.year + ')' : '')}
              <small className="note"> {result.genres}</small>
              <span className="float-right">{result.vote_average.toFixed(1)} <i className="fas fa-star"></i></span><small className="note float-right" style={{ marginTop: 3, marginRight: 10}}>{type === 'all' ? 'Show' : ''}</small>
            </h5>
            <p>{result.overview}</p>
          </div>
        </div>
      </Link>
    )
  }
}

class PersonResult extends Component {
  render() {
    const { result, type } = this.props;
    return (
      <Link className="search-result-link" to={'/person/' + result.id}>
        <div className="search-result d-flex flex-row">
          <div className="search-result-image">
            <img src={result.image_url} alt=""/>
          </div>
          <div className="search-result-content">
            <h5>
              {result.name}
              <small className="note float-right" style={{ marginTop: 3, marginRight: 10}}>{type === 'all' ? 'Person' : ''}</small>
            </h5>
            {result.known_for.length > 0 ? (
              <p>Known for {result.known_for}</p>
            ) : null}
            <p>{result.overview}</p>
          </div>
        </div>
      </Link>
    )
  }
}

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      results: null,
      error: null
    };
    this.updateSearch = this.updateSearch.bind(this);
  }

  componentDidMount() {
    this.updateSearch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.route.match.params.type !== this.props.route.match.params.type) {
      this.updateSearch();
      return;
    }
    const prevQuery = QueryString.parse(prevProps.route.location.search);
    const query = QueryString.parse(this.props.route.location.search);
    if (query.q !== prevQuery.q) {
      this.updateSearch();
      return;
    }
    if (query.page !== prevQuery.page) {
      this.updateSearch();
      return;
    }
  }

  updateSearch() {
    const { type } = this.props.route.match.params;
    const query = QueryString.parse(this.props.route.location.search);
    const page = query.page || 1;
    this.setState({
      loading: true,
      results: null,
      error: null
    });
    fetch('/api/search/' + type + '?csrfToken=' + this.props.csrfToken + '&q=' + query.q + '&page=' + page, {
      method: 'GET',
      credentials: 'include'
    }).then((res) => {
      res.json().then((data) => {
        if (data.error) {
          this.setState({
            loading: false,
            results: null,
            error: data.error
          });
        } else if (data.results) {
          this.setState({
            loading: false,
            results: data,
            error: null
          });
        } else {
          this.setState({
            loading: false,
            results: null,
            error: 'Unknown search error'
          });
        }
        // console.log(data);
      }).catch((err) => {
        console.log('Error parsing search results', err);
        this.setState({
          loading: false,
          results: null,
          error: 'Error parsing search results'
        });
      });
    }).catch((err) => {
      console.log('Error fetching search results', err);
      this.setState({
        loading: false,
        results: null,
        error: 'Error fetching search results'
      });
    });
  }

  render() {
    const { type } = this.props.route.match.params;
    const query = QueryString.parse(this.props.route.location.search).q;
    const { loading, results, error } = this.state;

    return (
      <div className="col-lg-10 col-md-12">
        <h3 className="page-header">
          Search <i className="fas fa-angle-right"></i> {type.charAt(0).toUpperCase() + type.slice(1)} <i className="fas fa-angle-right"></i> {query}
          {!loading && !error && results ? (
            <small className="note float-right">{results.totalResults} results</small>
          ) : null}
        </h3>
        <ul className="nav nav-fill">
          <li className="nav-item">
            <Link to={'/search/all?q=' + query} className={'nav-link' + (type === 'all' ? ' disabled' : '')}>All</Link>
          </li>
          <li className="nav-item">
            <Link to={'/search/movies?q=' + query} className={'nav-link' + (type === 'movies' ? ' disabled' : '')}>Movies</Link>
          </li>
          <li className="nav-item">
            <Link to={'/search/shows?q=' + query} className={'nav-link' + (type === 'shows' ? ' disabled' : '')}>Shows</Link>
          </li>
          <li className="nav-item">
            <Link to={'/search/people?q=' + query} className={'nav-link' + (type === 'people' ? ' disabled' : '')}>People</Link>
          </li>
        </ul>
        {
          loading ? (
            <p className="text-center search-loading">...</p>
          ) : error ? (
            <p className="text-center">{error}</p>
          ) : results ? (
            <>
              {results.results.map((result) => {
                if (result.media_type === 'movie') return <MovieResult result={result} type={type} key={result.id} />
                if (result.media_type === 'tv') return <TVResult result={result} type={type} key={result.id} />
                if (result.media_type === 'person') return <PersonResult result={result} type={type} key={result.id} />
                return null;
              })}
              <ResultsNav results={results} query={query} type={type} />
            </>
          ) : null
        }
      </div>
    )
  }
}

export default Search;
