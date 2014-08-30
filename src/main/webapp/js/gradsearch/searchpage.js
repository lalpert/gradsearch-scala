/** @jsx React.DOM */

/**
 * The entire search page
 */
var SearchPage = React.createClass({
  propTypes: {
    searchString: React.PropTypes.string,
  },

  getInitialState: function() {
    return {
       profArray: []
    }
  },

  render: function() {
    var profArray = this.state.profArray;
    numProfs = profArray ? profArray.length : "";
    return (
      <div className="searchpage">
      {numProfs} Professors researching {this.props.searchString}
      <ProfSection profArray={profArray}/>
      </div>
    );
  },

  componentDidMount: function() {
    // Get the search results
    var url = "/results?q=" + encodeURIComponent(this.props.searchString);
    var self = this;
    var jqxhr = $.get(url, function(data) {
      self.setState({profArray: data});
    })
  }
});

/**
 * Section containing boxes for all profs
 */

 // TODO: Animate moving boxes
var ProfSection = React.createClass({
  propTypes: {
    profArray: React.PropTypes.array
  },

  render: function() {
    allProfs = this.props.profArray.map(function(prof) {
      return <ProfBox profData={prof} key={prof.id}/>;
    });

    return <div> {allProfs} </div>;
  }
});

/**
 * Box with information for a single professor
 */
var ProfBox = React.createClass({
  propTypes: {
    profData: React.PropTypes.object
  },

  render: function() {
    var divStyle = {
      border: '1px solid blue',
      margin: '5px',
      padding: '10px'
    };

    return (
      <div className="prof-box" style={divStyle}>
      <p>Name: {this.props.profData.name}</p>
      <p>School: {this.props.profData.school}</p>
      </div>
    );
  }
});