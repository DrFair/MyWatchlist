import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './NavSearchbar.css';

class SearchResult extends Component {
  render() {
    const { result, selected, onClick } = this.props;
    return result ? (
      <Link
        to={'/' + result.type + '/' + result.id}
        onClick={onClick}
        className={'quick-search-item' + (selected ? ' active-search' : '')}
      >
        <div className="text">
          {result.title}
          {result.year ? ' (' + result.year + ')' : null}
        </div>
        <span className="badge badge-info float-right mr-3">{result.type}</span>
      </Link>
    ) : null;
  }
}

class SearchResults extends Component {
  render() {
    const results = this.props.loading ? (
      <div className="quick-search-item loading">...</div>
    ) : (
      this.props.results ? (
        this.props.results.length > 0 ? (
          this.props.results.map((r, i) => <SearchResult key={r.id} result={r} selected={i === this.props.selectedResult} onClick={this.props.onClick} />)
        ) : (
          <div>
            <div className="quick-search-item loading">No results found</div>
          </div>
        )
      ) : null
    )
    if (results === null) return null;
    return (
      <div className="quick-search quick-search-results">
        {results}
      </div>
    )
  }
}

class Searchbar extends Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.searchChangeCooldown = 250; // in ms
    this.searchTimer = null;
    this.oldSearchValue = "";
    this.state = {
      results: null,
      selectedResult: null,
      loading: false
    };
    this.clearSearch = this.clearSearch.bind(this);
    this.performSearch = this.performSearch.bind(this);
    this.inputChanged = this.inputChanged.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);
    this.inputKeyDown = this.inputKeyDown.bind(this);
  }

  clearSearch() {
    this.setState({
      results: null,
      selectedResult: null,
      loading: false
    });
    this.input.current.value = '';
    this.oldSearchValue = '';
    if (this.searchTimer !== null) clearTimeout(this.searchTimer);
    this.searchTimer = null;
  }

  performSearch(query) {
    // console.log('Performing search ' + query);
    if (query) {
      this.setState({
        loading: true,
        selectedResult: null
      });
      fetch('/api/search/quick?csrfToken=' + this.props.csrfToken + '&q=' + query, {
        method: 'GET',
        credentials: 'include',
      }).then((res) => {
        res.json().then((data) => {
          if (data.success && this.state.loading) {
            this.setState({
              loading: false,
              results: data.results
            });
          } else {
            this.setState({
              loading: false,
              results: null
            });
          }
          // console.log(data);
        });
      }).catch((err) => {
        console.log('Search error:', err);
      });
    }
  }

  inputKeyDown(event) {
    if (event.key === 'Escape') {
      if (this.state.results === null) return;
      event.preventDefault();
      if (this.state.selectedResult === null) {
        this.setState({
          results: null
        });
      } else {
        this.setState({
          selectedResult: null
        });
      }
    } else if (event.key === 'ArrowUp') {
      if (this.state.results === null) return;
      event.preventDefault();
      if (this.state.selectedResult === null) {
        this.setState({
          selectedResult: 0
        });
        return;
      }
      let selected = this.state.selectedResult - 1;
      if (selected < 0) selected = this.state.results.length + selected;
      this.setState({
        selectedResult: selected
      });
    } else if (event.key === 'ArrowDown') {
      if (this.state.results === null) return;
      event.preventDefault();
      if (this.state.selectedResult === null) {
        this.setState({
          selectedResult: 0
        });
        return;
      }
      this.setState({
        selectedResult: (this.state.selectedResult + 1) % this.state.results.length
      });
    }
  }

  inputChanged() {
    if (this.oldSearchValue === this.input.current.value) return;
    if (this.searchTimer !== null) clearTimeout(this.searchTimer);
    // Loading search
    this.searchTimer = setTimeout(() => {
      if (this.input.current.value.length > 2) { // Only search if query longer than 2 chars
        this.performSearch(this.input.current.value);
      } else {
        this.setState({
          results: null
        });
      }
      this.oldSearchValue = this.input.current.value;
    }, this.searchChangeCooldown);
  }

  searchSubmit(event) {
    event.preventDefault();
    if (this.state.selectedResult !== null) {
      const result = this.state.results[this.state.selectedResult];
      this.props.route.history.push('/' + result.type + '/' + result.id);
      this.clearSearch();
      this.props.setCollapse(false);
      // window.location.href = '/' + result.type + '/' + result.id;
      // this.setState({
      //   results: null,
      //   selectedResult: null,
      //   loading: false
      // });
    } else {
      if (this.input.current.value.length > 0) {
        this.props.route.history.push('/search/all?q=' + this.input.current.value);
        this.clearSearch();
        this.props.setCollapse(false);
        // window.location.href = '/search/all?q=' + this.input.current.value;
        // this.setState({
        //   results: null,
        //   selectedResult: null,
        //   loading: false
        // });
      }
    }
  }

  render() {
    // console.log(this.input);
    return (
      <div className="search-form">
        <form className="form-inline">
          <input
            ref={this.input}
            className="form-control quick-search-bar"
            style={{flexGrow: '1'}}
            type="search"
            placeholder="Search for movie, tv show, person"
            autoCorrect="off"
            autofill="off"
            autoComplete="off"
            spellCheck="false"
            defaultValue=""
            onChange={this.inputChanged}
            onKeyDown={this.inputKeyDown}
          />
          <button type="submit" className="btn btn-primary mx-1 mr-4" onClick={this.searchSubmit}>Search</button>
          <SearchResults
            results={this.state.results}
            loading={this.state.loading}
            selectedResult={this.state.selectedResult}
            onClick={this.clearSearch}
          />
        </form>
      </div>
    )
  }
}

export default Searchbar;
