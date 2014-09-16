/** @jsx React.DOM */

var StarredSearchPage = React.createClass({
  propTypes: {
    starredSearches: React.PropTypes.array
  },

  getJsonFromQueryString: function(searchString) {
    var result = {};
    searchString.split("&").forEach(function(part) {
      var item = part.split("=");
      var key = item[0];
      var val = decodeURIComponent(item[1]);
      if (result[key]) {
        result[key].push(val);
      } else {
        result[key] = [val];
      }
    });
    console.log(result);
    return result;
  },

  render: function() {
  var self = this;
    console.log("starred searches", this.props.starredSearches);
    var searches = _.map(this.props.starredSearches, function(searchURL) {
      console.log(searchURL);
      console.log(self.getJsonFromQueryString(searchURL));
      var filters = self.getJsonFromQueryString(searchURL);
      return <SearchInfoBuilder
        numProfs=""
        starredOptions={filters["Starred"]}
        uniOptions={filters["University"]}
        deptOptions={filters["Department"]}
        searchString={filters["q"][0] || ""}
        searchURL={searchURL}
        setSearchStarred=""
        starred={true}
        key={searchURL}
      />;
    });

    return <div className="container">
      <h2>Your starred searches</h2>
      {searches}
    </div>;
  }
});