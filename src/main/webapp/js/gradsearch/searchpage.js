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
       hidden: false
    }
  },

  handleFilterChange: function(hidden) {
    this.setState({hidden: hidden});
  },

  render: function() {
    var visibleProfs = this.state.visibleProfs;
    numProfs = visibleProfs ? visibleProfs.length : "";
    return (
      <div className="searchpage">
        {numProfs} Professors researching {this.props.searchString}
        <ProfSection profArray={visibleProfs} hidden={this.state.hidden}/>
        <FilterBar onChange={this.handleFilterChange} checked={!this.state.hidden}/>
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
    hidden: React.PropTypes.bool.isRequired
  },

  render: function() {
    allProfs = this.props.profArray.map(function(prof) {
      return <ProfBox profData={prof} key={prof.id}/>;
    });
    if (this.props.hidden) {
        return <div className="container-fluid"/>;
    } else {
        return <div className="container-fluid">
           {allProfs}
        </div>;
    }
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
        checked: React.PropTypes.bool
      },
      handleChange: function(event) {
        this.props.onChange(event.target.checked);
      },
      render: function() {
        var checked = this.props.checks;
        return <input type="checkbox" checked={checked} onChange={this.handleChange} />;
      }
});
/* TODO: finish implementing filters

//Sidebar with filters
var FilterBar = React.createClass({
  propTypes: {
    // Array of objects containing name, num, and checked for each option
    universities: React.propTypes.array,
    departments: React.propTypes.array,
    starred: React.propTypes.array,
  },


  //Return div containing checkboxes for each option

  makeSection: function(attribute) {
    // TODO: get underscore and do fancy filtering
  }

  render: function() {
    //var starred
    var universities = makeSection("school");
    var departments = makeSection("department");

    return <div>
      <h3>Filter results by:</h3>

      <h4>Starred</h4>
      <FilterSection title="Starred" choices={starred}/>

      <h4>University</h4>
      <FilterSection title="University" choices={universities}/>

      <h4>Department</h4>
      <FilterSection title="Department" choices={departments}/>
    </div>
  }
});



// Filter section, such as University or Department
var FilterSection = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    // Array of objects with title and number
    choices: React.PropTypes.array,
  },

  render: function() {

  }
});

*/