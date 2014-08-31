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
       allProfs: [],
       visibleProfs: [],
       filters: []
    }
  },

  handleFilterChange: function(hidden) {
    this.setState({filters: filters});
  },

  getUniData: function() {
    return _.countBy(this.state.visibleProfs, function(prof) { return prof["school"] });
  },

  render: function() {
    var visibleProfs = this.state.visibleProfs;
    numProfs = visibleProfs ? visibleProfs.length : "";
    var uniData = this.getUniData();
    return (
      <div className="searchpage">
        {numProfs} Professors researching {this.props.searchString}
        <ProfSection profArray={visibleProfs} filters={this.state.filters}/>
        <FilterBar onChange={this.handleFilterChange} filters={this.state.filters} uniChoices={uniData}/>
      </div>
    );
  },

  componentDidMount: function() {
    // Get the search results
    var url = "/results?q=" + encodeURIComponent(this.props.searchString);
    var self = this;
    var jqxhr = $.get(url, function(data) {
      self.setState({
        allProfs: data,
        visibleProfs: data
      });
    })
  }
});

/**
 * Section containing boxes for all profs
 */
var ProfSection = React.createClass({
  propTypes: {
    profArray: React.PropTypes.array,
  },

  render: function() {
    allProfs = this.props.profArray.map(function(prof) {
      return <ProfBox profData={prof} key={prof.id}/>;
    });

    return <div className="container-fluid">
       {allProfs}
    </div>;
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

    <div className="media">
      <a className="pull-left" href="#">
        <img className="media-object" data-src="holder.js/64x64" alt="Generic placeholder image"/>
      </a>
      <div className="media-body">
        <h4 className="media-heading">{this.props.profData.name}</h4>
        <p>{this.props.profData.school}</p>
      </div>
    </div>

    );
  }
});

var FilterBar = React.createClass({
      propTypes: {
        onChange: React.PropTypes.func,
        filters: React.PropTypes.array,
        uniChoices: React.PropTypes.object.isRequired
      },

      handleChange: function(event) {
        var filterFunc = function(data) {
            return event.target.checked;
        }
        //this.props.onChange([filterFunc]);
      },

      render: function() {
        var checked = this.props.checked;
        return <div>
            <FilterSection title="University" choices={this.props.uniChoices}/>
        </div>
      }
});

//Filter section, such as University or Department
var FilterSection = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    // Array of objects with title and number
    choices: React.PropTypes.array,
  },

  render: function() {
     var options = _.map(this.props.choices, function(num, name) {
        return <div>{name} ({num})</div>
     });
     return <div>
        {this.props.title}
        {options}
     </div>
  }
});
