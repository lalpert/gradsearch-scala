/** @jsx React.DOM */
var SearchPage = React.createClass({
  propTypes: {
    searchString: React.PropTypes.string
  },

  render: function() {
    return (
      <div className="searchpage">
      Hello!
        Professors researching {this.props.searchString}!
      </div>
    );
  }
});