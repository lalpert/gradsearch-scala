/** @jsx React.DOM */

/**
 * The entire search page
 * Holds state for the whole page, including the list of all profs matching the search term and the currently selected
 * filters.
 */
var SearchPage = React.createClass({
  propTypes: {
    searchString: React.PropTypes.string,
  },

  getInitialState: function() {
    return {
      // Will be loaded through ajax
      // visibleProfs will look like:
      // [
      //   {name: "Leah", department: "CS", school: "MIT", ...},
      // ]
      visibleProfs: [],
      // All possible filters + counts that the user can filter by
      // Sent down by the server
      // Looks like:
      // [
      //   {"category": "University", "counts": {"MIT": 2}},
      //   {"category": "Department", "counts": {"CS": 2,"EE": 2}}
      // ]
      filterOptions: [],
      // Starts with no filters; users can add filter by clicking uni/dept checkboxes
      // selectedFilters will be look like:
      // {
      //   "University": {"MIT": true, "Stanford": true},
      //   "Department": {"CS": true}
      // }
      selectedFilters: {
        "University": {},
        "Department": {}
      },
      // Which prof is currently displayed in the modal.
      // ID of the prof, or null when there is no modal displayed.
      currentProfID: null,
    }
  },

  buildUrl: function() {
    var url = "/results?q=" + encodeURIComponent(this.props.searchString);
    _.each(this.state.selectedFilters, function(filterVals, filterName) {
      _.each(filterVals, function(checked, name) {
        if (checked) {
          url += "&" + filterName + "=" + encodeURIComponent(name);
        }
      });
    });
    return url;
  },

  getProfs: function() {
    var self = this;
    var url = this.buildUrl();
    var jqxhr = $.get(url, function(data) {
      self.setState({
        visibleProfs: data.professors,
        filterOptions: data.counts
      });
    });
  },

  /**
   * Add or remove a filter
   */
   updateFilters: function(title, name, checked) {
     var newFilters = this.state.selectedFilters
     newFilters[title][name] = checked;
     this.setState({selectedFilters: newFilters});
     // Get the professors matching the new filters
     this.getProfs();
   },

   showProfModal: function(profId) {
     this.setState({currentProfID: profId})
   },

   hideModal: function() {
     this.setState({currentProfID: null})
   },

   findProf: function(profId) {
     return _.findWhere(this.state.visibleProfs, {id: profId});
   },

   showNextProf: function(direction) {
     var profIds = _.pluck(this.state.visibleProfs, "id");
     var currentIndex = _.indexOf(profIds, this.state.currentProfID);

     if (direction == "next") {
       if (currentIndex < profIds.length - 1) {
         this.setState({currentProfID: profIds[currentIndex + 1]})
       }
     } else {
       if (currentIndex > 0) {
         this.setState({currentProfID: profIds[currentIndex - 1]})
       }
     }
   },

  render: function() {
    var visibleProfs = this.state.visibleProfs;
    var numProfs = visibleProfs.length ? visibleProfs.length : "";
    var currentProf = this.findProf(this.state.currentProfID);
    console.log(currentProf);
    return (
      <div className="search-container">

        <div className="modal-div">
          <ModalDiv
            currentProf={currentProf}
            showNextProf={this.showNextProf}
            hideModal={this.hideModal}
          />
        </div>

        {numProfs} Professors researching {this.props.searchString}
        <FilterBar
              onChange={this.updateFilters}
              filterOptions={this.state.filterOptions}
              selectedFilters={this.state.selectedFilters}
           />
        <ProfSection profArray={visibleProfs} showModal={this.showProfModal}/>
      </div>
    );
  },

  componentDidMount: function() {
    // Get the search results
    $("#navbar-search-box").val(this.props.searchString);
    this.getProfs();
  },
 });

/**
 * Section containing boxes for all profs
 */
var ProfSection = React.createClass({
  propTypes: {
    profArray: React.PropTypes.array,
    showModal: React.PropTypes.func,
  },

  render: function() {
    var showModal = this.props.showModal;
    allProfs = this.props.profArray.map(function(prof) {
      return <ProfBox profData={prof} key={prof.id} showModal={showModal}/>;
    });

    return <div className="row">
      {allProfs}
    </div>;
  }
});

var ProfBox = React.createClass({
  propTypes: {
    profData: React.PropTypes.object,
    showModal: React.PropTypes.func,
  },

  handleClick: function() {
    this.props.showModal(this.props.profData.id);
  },

  formatKeywords: function(keywords) {
    return _.first(keywords, 3).join(", ");
  },

  render: function() {
    var prof = this.props.profData;
    var divStyle = {
      //width: 300,
      height: 137,
      overflow: "hidden",
      textOverflow: "ellipsis"
    };
    var gridStyle = {
      paddingLeft: 5,
      paddingRight: 5
    }

    var thumbStyle = {
        paddingRight: 10
    }

    var aboveFold = {
         height: 100
    }

    var hrStyle = {
        marginTop: 3,
        marginBottom: 3
    }

    var belowFold = {
        paddingLeft: 10
    }

    return (
      <div className="col-sm-6 col-md-4" style={gridStyle}>
        <div className="thumbnail" style={divStyle} onClick={this.handleClick}>
          <div style={aboveFold}>
              <a className="pull-left" href="#" style={thumbStyle}>
                <img className="media-object" src="http://placehold.it/100x100" alt="Generic placeholder image"/>
              </a>
              <div>
                <h4 className="media-heading">{this.props.profData.name}</h4>
                <p>{prof.school}</p>
                <p>{prof.department}</p>
              </div>
          </div>
          <hr style={hrStyle}/>
          <div style={belowFold}>
            <p>{this.formatKeywords(prof.keywords)}</p>
          </div>
        </div>
      </div>
    );
  }
});

var FilterBar = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    filterOptions: React.PropTypes.array.isRequired,
    selectedFilters: React.PropTypes.object.isRequired
  },

  getChoices: function(category) {
    var choices = _.findWhere(this.props.filterOptions, {"category": category});
    if (choices) {
      return choices.counts;
    } else {
       return {};
    }
  },

  render: function() {
    var checked = this.props.checked;
    var filterStyle = {
        height: "100%"
    }
    return <div className="col-xs-6 col-sm-3 sidebar-offcanvas" style={filterStyle} id="sidebar" role="navigation">
      <FilterSection
        title="University"
        choices={this.getChoices("University")}
        selectedFilters={this.props.selectedFilters["University"]}
        handleChange={this.props.onChange}
      />
      <FilterSection
        title="Department"
        choices={this.getChoices("Department")}
        selectedFilters={this.props.selectedFilters["Department"]}
        handleChange={this.props.onChange}
      />
    </div>
  }
});

//Filter section, such as University or Department
var FilterSection = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    // e.g. {"MIT": 3, "Stanford":2}
    choices: React.PropTypes.object.isRequired,
    // e.g. {"MIT": true, "Stanford": false}
    selectedFilters: React.PropTypes.object.isRequired,
    handleChange: React.PropTypes.func.isRequired,
  },

  render: function() {
     var self = this;
     var title = this.props.title
     var options = _.map(this.props.choices, function(num, name) {
        var checked = Boolean(self.props.selectedFilters[name]);
        return <FilterOption
          key={title + name}
          title={title}
          checked={checked}
          value={name}
          num={num}
          handleChange={self.props.handleChange}
        />
     });

     return <div>
        <h4>{title}</h4>
        {options}
     </div>
  }
});


var FilterOption = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired,
    num: React.PropTypes.number.isRequired,
    checked: React.PropTypes.bool.isRequired,
    handleChange: React.PropTypes.func.isRequired,
  },

  handleClick: function(event) {
    this.props.handleChange(this.props.title, this.props.value, event.target.checked)
  },

  render: function() {
    var title = this.props.title;
    var value = this.props.value;
    var num = this.props.num;
    var checked = this.props.checked;
    return <div className="checkbox">
      <label>
        <input type="checkbox" name={title} value={value} checked={checked} onChange={this.handleClick}/>
        {value} ({num})
      </label>
    </div>
  }
});