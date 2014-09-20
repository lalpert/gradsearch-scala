/** @jsx React.DOM */

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

/**
 * The entire search page
 * Holds state for the whole page, including the list of all profs matching the search term and the currently selected
 * filters.
 */

 // Here is the simplest possible mixin to get a global scroll event
var PageScrollMixin = {
    componentDidMount: function() {
        window.addEventListener('scroll', this.onScroll, false);
    },
    componentWillUnmount: function() {
        window.removeEventListener('scroll', this.onScroll, false);
    }
};

var SearchPage = React.createClass({
  propTypes: {
    searchString: React.PropTypes.string.isRequired,
    filters: React.PropTypes.object.isRequired,
    loggedIn: React.PropTypes.bool.isRequired,
    isFullUser: React.PropTypes.bool.isRequired,
  },

  mixins: [PageScrollMixin],

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
      // filterOptions looks like:
      // [
      //   {"category": "University", "counts": {"MIT": 2}},
      //   {"category": "Department", "counts": {"CS": 2,"EE": 2}}
      //   {"category": "Starred", "counts": {"true": 5, "false": 0}}
      // ]
      filterOptions: [],

      // Starts with no filters; users can add filter by clicking uni/dept checkboxes
      // selectedFilters looks like:
      // {
      //   "University": {"MIT": true, "Stanford": true},
      //   "Department": {"CS": true}
      // }
      selectedFilters: this.props.filters,

      // Which prof is currently displayed in the modal.
      // ID of the prof, or null when there is no modal displayed.
      currentProfID: null,

      // The number of professors we've starred by clicking on them on the client side.
      clientSideStarredCount: 0,

      // Whether the current search has been starred by the user.
      // Fetched through ajax, then can be changed client-side.
      isSearchStarred: false,

      // Whether we are actively loading more professors
      loadingMoreProfessors: false,

    }
  },

 /*
  * Use the currently selected filters in this.state to build a URL for this search
  */
  buildUrlParams: function(start) {
    if (start == undefined) {
      start = 0;
    }
    var url = "q=" + encodeURIComponent(this.props.searchString);
    _.each(this.state.selectedFilters, function(filterVals, filterName) {
      _.each(filterVals, function(checked, name) {
        if (checked) {
          url += "&" + filterName + "=" + encodeURIComponent(name);
        }
      });
    });
    return url + "&start=" + start;
  },

 /*
  * Fetch professors who match the current search + filters. Update state accordingly.
  */
  getProfs: function(concat) {
    if (this.state.loadingMoreProfessors || 
      (this.state.visibleProfs.length == this.state.totalProfessors && concat == true)) {
      return;
    }
    this.setState({loadingMoreProfessors: true});
    var offset = concat ? this.state.visibleProfs.length + 1 : 0;
  
    var self = this;
    var url = "/results?" + this.buildUrlParams(offset);
    var jqxhr = $.get(url, function(data) {
      var profs = concat ? self.state.visibleProfs.concat(data.professors) : data.professors;
     
      self.setState({
        visibleProfs: profs,
        filterOptions: data.counts,
        totalProfessors: data.totalProfessors,
        clientSideStarredCount: 0,
        loadingMoreProfessors: false
      });
    });
  },

  /*
   * Find out whether the current search is starred by the user.
   */
  getSearchStarred: function() {
    var self = this;
    var url = "/starred-search";
    var jqxhr = $.get(url, {searchString: this.buildUrlParams()})
    .done(function(isStarred) {
      self.setState({
        isSearchStarred: isStarred
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

  /*
   * Uncheck all boxes in a filter section (such as Universities)
   */
  clearSection: function(title) {
    var newFilters = this.state.selectedFilters
    newFilters[title] = {};
    this.setFilters(newFilters);
  },

  /*
   * Given a new set of filters, update the URL, get the profs matching the search,
   * and find out whether the search is starred.
   */
  setFilters: function(newFilters) {
    this.setState({selectedFilters: newFilters});
    var newUrl = "/search?" + this.buildUrlParams();
    window.history.pushState("", "", newUrl);
    // Get the professors matching the new filters
    this.getProfs(false);
    this.getSearchStarred();
  },

  // Functions to determine which prof modal is currently shown
  showProfModal: function(profId) {
    this.setState({currentProfID: profId})
  },

  hideModal: function() {
    this.setState({currentProfID: null})
  },

  findProf: function(profId) {
    return _.findWhere(this.state.visibleProfs, {id: profId});
  },

  getCurrentProfIndex: function() {
    var profIds = _.pluck(this.state.visibleProfs, "id");
    return  _.indexOf(profIds, this.state.currentProfID);
  },

  showNextProf: function(direction) {
    var profIds = _.pluck(this.state.visibleProfs, "id");
    var currentIndex = this.getCurrentProfIndex();
    if (direction == "next") {
      if (currentIndex < this.state.visibleProfs.length - 1) {
        this.setState({currentProfID: profIds[currentIndex + 1]})
      }
    } else {
      if (currentIndex > 0) {
        this.setState({currentProfID: profIds[currentIndex - 1]})
      }
    }
  },

  /*
   * Show the "Anonymous user" alert that tells people to log in to save their data.
   * Use cookies to only show the alert if the user has not hidden it before.
   */
  maybeShowAlert: function() {
    // If they are not logged in and have never hidden the anon user alert, show alert
    var alertHidden = $.cookie('anonAlert') === "hide";
    if (!this.props.isFullUser && !alertHidden) {
      $.cookie('anonAlert', 'show');
    }
    // Trigger a rerender
    this.setState({});
  },

  closeAlert: function() {
    $.cookie('anonAlert', 'hide');
    // Trigger a rerender
    this.setState({});
  },

  /*
   * Star a professor.
   * Update the star and the starred filter count on the client.
   * Send the star info to the server. Show the Anon user alert if necessary.
   */
  setStarred: function(profId, starred) {
    // Instantly update the starred variables on the client
    var prof = this.findProf(profId);
    if (prof.starred != starred) {
        prof.starred = starred;

        var diff = starred ? 1 : -1;
        var newClientCount =  this.state.clientSideStarredCount + diff;

        this.setState({
          // We altered visibleProfs, so explicitly re-set it here
          visibleProfs: this.state.visibleProfs,
          clientSideStarredCount: newClientCount
        });

        this.maybeShowAlert();

        // Send the starred info to the server
        $.post("/star-prof", {profId: profId, starred: starred});
    } else {
        console.warn("Called starred on a professor that was already starred");
    }
  },

  /*
   * Star a search.
   * Update the star on the client.
   * Send the star info to the server. Show the Anon user alert if necessary.
   */
  setSearchStarred: function(starred) {
     this.setState({isSearchStarred: starred});
     this.maybeShowAlert();
     $.post("/star-search", {
       searchString: this.buildUrlParams(),
       starred: starred
     });
  },

  onScroll: function(scroll) {
    if($(window).scrollTop() + window.innerHeight + 300 > $(document).height()) {
      this.getProfs(true);  
    }
  },

  render: function() {
    var visibleProfs = this.state.visibleProfs;
    var currentProf = this.findProf(this.state.currentProfID);
    var numStarredClientSide = this.state.clientSideStarredCount;
    var loading = this.state.loadingMoreProfessors;
    var anonAlertDiv = "";
    if ($.cookie('anonAlert') == 'show') {
      anonAlertDiv = <AnonUserAlert key="anonalert" closeAlert={this.closeAlert}/>
    }

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

          <ReactCSSTransitionGroup transitionName="anonalert">
            {anonAlertDiv}
          </ReactCSSTransitionGroup>

          <SearchInfoFromFilters
            filters={this.state.selectedFilters}
            numProfs={this.state.totalProfessors}
            searchString={this.props.searchString}
            starred={this.state.isSearchStarred}
            setSearchStarred={this.setSearchStarred}
            loading={loading}
          />

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
    this.getSearchStarred();
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.currentProfID != prevState.currentProfID) {
      var currentIndex = this.getCurrentProfIndex();
      if (this.state.visibleProfs.length - currentIndex < 3) {
        this.getProfs(true);
      }
    }
  }
 });




var AnonUserAlert = React.createClass({
  propTypes: {
    closeAlert: React.PropTypes.func
  },

  render: function() {
    return <div className="alert alert-warning alert-dismissible search-string-div" role="alert">
      <button type="button" className="close" onClick={this.props.closeAlert}>
        <span aria-hidden="true">&times;</span>
        <span className="sr-only">Close</span>
      </button>
      Nice, you starred your first professor! Be sure to <a href="/login">log in</a> so your stars will be
      saved when you come back - otherwise, they'll be reset when you close the browser.
    </div>;
  }
});