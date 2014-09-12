/** @jsx React.DOM */

/**
 * The entire search page
 * Holds state for the whole page, including the list of all profs matching the search term and the currently selected
 * filters.
 */
var SearchPage = React.createClass({
  propTypes: {
    searchString: React.PropTypes.string.isRequired,
    filters: React.PropTypes.object.isRequired,
    loggedIn: React.PropTypes.bool.isRequired
  },

  getInitialState: function() {
    return {
      // Will be loaded through ajax
      // visibleProfs will look like:
      // [
      //   {name: "Leah", department: "CS", school: "MIT", ...},
      // ]
      visibleProfs: [],

      // eg. 5
      totalProfessors: 0,

      // All possible filters + counts that the user can filter by
      // Sent down by the server
      // Looks like:
      // [
      //   {"category": "University", "counts": {"MIT": 2}},
      //   {"category": "Department", "counts": {"CS": 2,"EE": 2}}
      //   {"category": "Starred", "counts": {"true": 5, "false": 0}}
      // ]
      filterOptions: [],

      // Starts with no filters; users can add filter by clicking uni/dept checkboxes
      // selectedFilters will be look like:
      // {
      //   "University": {"MIT": true, "Stanford": true},
      //   "Department": {"CS": true}
      // }
      // TODO: Read initial filters from URL
      selectedFilters: this.props.filters,
      // Which prof is currently displayed in the modal.
      // ID of the prof, or null when there is no modal displayed.
      currentProfID: null,
      // List of searches the user has starred before

      // The number of professors we've starred by clicking on them on the client side.
      clientSideStarredCount: 0

    }
  },

  buildUrlParams: function() {
    var url = "q=" + encodeURIComponent(this.props.searchString);
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
    var url = "/results?" + this.buildUrlParams();
    var jqxhr = $.get(url, function(data) {
      self.setState({
        visibleProfs: data.professors,
        filterOptions: data.counts,
        totalProfessors: data.totalProfessors,
        clientSideStarredCount: 0
      });
    });
  },

  /**
   * Add or remove a filter
   */
  updateFilters: function(title, name, checked) {
    var newFilters = this.state.selectedFilters
    newFilters[title][name] = checked;
    this.setFilters(newFilters);
  },

  clearSection: function(title) {
    var newFilters = this.state.selectedFilters
    newFilters[title] = {};
    this.setFilters(newFilters);
  },

  setFilters: function(newFilters) {
    this.setState({selectedFilters: newFilters});
    var newUrl = "/search?" + this.buildUrlParams();
    window.history.pushState("", "", newUrl);
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

  stringFromFilterList: function(filterName, filterNamePlural, introString) {
    var filter = this.state.selectedFilters[filterName];
    var options = _.filter(_.keys(filter), function(opt) {
       return filter[opt];
    });

    if (options.length === 0) {
      return "";
    } else if (options.length === 1) {
      return " " + introString + " " + options[0];
    } else {
      return " " + introString + " " + options.length + " " + filterNamePlural;
    }
  },

  // Turn search string + filters into a string
  getSearchString: function() {
    var visibleProfs = this.state.visibleProfs;
    var numProfs = this.state.totalProfessors;
    var starredString = this.state.selectedFilters["Starred"]["Starred"] ? " starred" : "";
    var uniString = this.stringFromFilterList("University", "universities", "at");
    var deptString = this.stringFromFilterList("Department", "departments", "in");
    return numProfs + starredString + " professors researching " + this.props.searchString +
      uniString + deptString;
  },

  setStarred: function(profId, starred) {
    // Instantly update the starred variables on the client
    if (!this.props.loggedIn) {
      // TODO: implement anonymous users, or something
      console.log("Can't star. You need to login.");
      return;
    }
    var prof = this.findProf(profId);
    if (prof.starred != starred) {
        prof.starred = starred;
        var diff = starred ? 1 : -1;
        this.setState({visibleProfs: this.state.visibleProfs, clientSideStarredCount: this.state.clientSideStarredCount + diff});
        // Send the starred info to the server
        $.post("/star-prof", {profId: profId, starred: starred});
    } else {
        console.warn("Called starred on a professor that was already starred");
    }
  },

  setSearchStarred: function(starred) {
    // TODO: Ajax call to set state on server
  },

  render: function() {
    var visibleProfs = this.state.visibleProfs;
    var currentProf = this.findProf(this.state.currentProfID);
    var numStarredClientSide = this.state.clientSideStarredCount;
    var starImg = "gray_star.png"; //this.props.search.starred ? "gold_star.png" : "gray_star.png";

    return (
      <div className="search-container">

        <div className="modal-div">
          <ModalDiv
            currentProf={currentProf}
            showNextProf={this.showNextProf}
            hideModal={this.hideModal}
          />
        </div>

        <div className="col-sm-3">
          <FilterBar
            onChange={this.updateFilters}
            clearSection={this.clearSection}
            filterOptions={this.state.filterOptions}
            selectedFilters={this.state.selectedFilters}
            numStarredClientSide={numStarredClientSide}
          />
        </div>

        <div className="col-sm-9">
          <div className="alert alert-info search-string-div" role="alert">
            {this.getSearchString()}
            <div className="search-text-div">
              <span>Save search</span>
              <img src={"/images/" + starImg} className="search-star" height="25px" onClick={this.setSearchStarred}/>
            </div>
          </div>

          <ProfSection
            profArray={visibleProfs}
            showModal={this.showProfModal}
            setStarred={this.setStarred}
          />
        </div>
      </div>
    );
  },

  componentDidMount: function() {
    // Get the search results
    $("#navbar-search-box").val(this.props.searchString);
    this.getProfs();
  },
 });