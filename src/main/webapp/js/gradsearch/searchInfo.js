/** @jsx React.DOM */

/*
 * Take in filter object from the server and render a searchInfo box
 */
var SearchInfoFromFilters = React.createClass({
  propTypes: {
    numProfs: React.PropTypes.number.isRequired,
    filters: React.PropTypes.object.isRequired,
    searchString: React.PropTypes.string.isRequired,
    loading: React.PropTypes.bool.isRequired
  },

  getOptions: function(filterName) {
    var filter = this.props.filters[filterName];
    var options = _.filter(_.keys(filter), function(opt) {
       return filter[opt];
    });
    return options;
  },

  render: function() {
    return this.transferPropsTo(<SearchInfoBuilder
      numProfs={this.props.numProfs} // actually should be number or null?
      starredOptions={this.getOptions("Starred")}
      uniOptions={this.getOptions("University")}
      deptOptions={this.getOptions("Department")}
      searchString={this.props.searchString}
      loading={this.props.loading}
    />)
  }
});

/*
 * Take in lists of filter options and render a searchInfo box
 */
var SearchInfoBuilder = React.createClass({
  propTypes: {
    numProfs: React.PropTypes.number, // actually should be number or null?
    starredOptions: React.PropTypes.array,
    uniOptions: React.PropTypes.array,
    deptOptions: React.PropTypes.array,
    searchString: React.PropTypes.string,
    loading: React.PropTypes.bool
  },

  // Make a segment like "at 2 universities" from filter info
  buildStringSegment: function(options, introString, filterNamePlural) {
    if (!options || options.length === 0) {
      return "";
    } else if (options.length === 1) {
      return " " + introString + " " + options[0];
    } else {
      return " " + introString + " " + options.length + " " + filterNamePlural;
    }
   },

  // Make search string from # profs...
  makeSearchString: function() {
    var profString = this.props.numProfs == 1 ? " professor " : " professors ";
    var starredString = _.contains(this.props.starredOptions, "Starred") ? " starred" : "";
    var uniString = this.buildStringSegment(this.props.uniOptions, "at", "universities")
    var deptString = this.buildStringSegment(this.props.deptOptions, "in", "departments")
    var researchString = this.props.searchString.length > 0 ? "researching " : "";

    var str = this.props.numProfs + starredString + profString + researchString + this.props.searchString +
        uniString + deptString;
    // Strip whitespace
    str = str.trim()
    // Capitalize
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  render: function() {
    var description = this.makeSearchString();
    if (this.props.loading && this.props.numProfs == 0) {
      return this.transferPropsTo(<SearchInfo description="Loading..."/>);
    } else {
      return this.transferPropsTo(<SearchInfo description={description}/>);
    }
  }
});


/*
 * Take in the description and render a searchInfo box
 */
var SearchInfo = React.createClass({
  propTypes: {
    // What should be displayed in the box
    description: React.PropTypes.string,
    // The URL string representing the search (used on starred searches page)
    searchURL: React.PropTypes.string,
    setSearchStarred: React.PropTypes.func,
    starred: React.PropTypes.bool
  },

  render: function() {
    var starImg = this.props.starred ? "gold_star.png" : "gray_star.png";
    var href = "/search?" + this.props.searchURL;

    var descriptionDiv;
    if (this.props.searchURL) {
      descriptionDiv = <a href={href}>{this.props.description}</a>;
    } else {
      descriptionDiv = <span>{this.props.description}</span>;
    }

    return <div className="alert alert-info search-string-div" role="alert">
      {descriptionDiv}
      <div className="search-text-div">
        <span>Save search</span>
        <img src={"/images/" + starImg} className="search-star" height="25px"
          onClick={_.partial(this.props.setSearchStarred, !this.props.starred)}/>
      </div>
    </div>;
  }
});