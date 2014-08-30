/** @jsx React.DOM */

/**
 * The entire search page
 */
var SearchPage = React.createClass({
  propTypes: {
    searchString: React.PropTypes.string,
    profArray: React.PropTypes.array
  },

 // JUST for testing! replace with []
    getDefaultProps: function() {
      return {
         profArray: [
         {"name": "Leah", "school": "MIT"},
         {"name": "Russell", "school": "MIT"},
         ]
       }
     },

  render: function() {
    return (
      <div className="searchpage">
      Professors researching {this.props.searchString}!
      <ProfSection profArray={this.props.profArray}/>
      </div>
    );
  },

  componentDidMount: function() {
    // ajax call to get actual prof data
  }
});

/**
 * Section containing boxes for all profs
 */
var ProfSection = React.createClass({
  propTypes: {
    profArray: React.PropTypes.array
  },



  render: function() {
    allProfs = this.props.profArray.map(function(prof) {
      return <ProfBox profData={prof}/>;
    });

    return <div> {allProfs} </div>;
  },

  componentDidUpdate: function() {
    // Animate moving boxes?? or does that go somewhere else?
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