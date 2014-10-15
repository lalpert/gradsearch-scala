/** @jsx React.DOM */

var FilterWrapper = React.createClass({

    getInitialState: function() {
      return {show: false};
    },

    toggleText: function() {
        console.log("test");
        this.setState({show: !this.state.show, test: "test"});
    },

    render: function() {
        var buttonText = this.state.show ? "Hide filters" : "Show filters";
        var filters = this.transferPropsTo(<FilterBar/>);

        return <div>
           <button type="button"
                   onClick={this.toggleText}
                   className="btn btn-primary btn-block btn-tall visible-xs-block"
                   data-toggle="collapse" data-target="#filter-div">
             {buttonText}
           </button>

           <div id="filter-div" className="collapse">
               {filters}
           </div>

           <div className="visible-xs-block buffer"></div>
         </div>;

    },
});


/**
 * Filter bar on the left of the search page that lets users filter by starred, university, and department.
 */
var FilterBar = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    clearSection: React.PropTypes.func.isRequired,
    filterOptions: React.PropTypes.array.isRequired,
    selectedFilters: React.PropTypes.object.isRequired,
    numStarredClientSide: React.PropTypes.number.isRequired
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
    var serverSideStarred = this.getChoices("Starred")["true"];
    if (!serverSideStarred) {
        serverSideStarred = 0;
    }
    var starred = {"Starred": this.props.numStarredClientSide + serverSideStarred };

    return <div id="sidebar">
      <h4>Filter results by:</h4>
     <FilterSection
        title="Starred"
        choices={starred}
        selectedFilters={this.props.selectedFilters["Starred"]}
        handleChange={this.props.onChange}
        clearAll={this.props.clearSection}
      />
      <FilterSection
        title="University"
        choices={this.getChoices("University")}
        selectedFilters={this.props.selectedFilters["University"]}
        handleChange={this.props.onChange}
        clearAll={this.props.clearSection}
      />
      <FilterSection
        title="Department"
        choices={this.getChoices("Department")}
        selectedFilters={this.props.selectedFilters["Department"]}
        handleChange={this.props.onChange}
        clearAll={this.props.clearSection}
      />
    </div>
  }
});

//Filter section, such as University or Department
var FilterSection = React.createClass({

  DEFAULT_OPTIONS_SHOWN: 10,

  propTypes: {
    title: React.PropTypes.string.isRequired,
    // e.g. {"MIT": 3, "Stanford":2}
    choices: React.PropTypes.object.isRequired,
    // e.g. {"MIT": true, "Stanford": false}
    selectedFilters: React.PropTypes.object.isRequired,
    handleChange: React.PropTypes.func.isRequired,
    clearAll: React.PropTypes.func.isRequired,
  },

  getInitialState: function() {
    return {showAllOptions: false};
  },

  clearAll: function(event) {
    event.preventDefault();
    this.props.clearAll(this.props.title);
  },

  showAll: function(event) {
    event.preventDefault();
    this.setState({showAllOptions: true});
  },

  showLess: function(event) {
    event.preventDefault();
    this.setState({showAllOptions: false});
  },

  render: function() {
     var self = this;
     var title = this.props.title
     // choices is an array like [["CS", 3], ["EE", 1]]
     var choices = _.pairs(this.props.choices);
     var allSortedChoices = _.sortBy(choices, function(choice) {
       return -1 * choice[1]; // Highest count to lowest
     });

     if (!this.state.showAllOptions) {
       sortedChoices = allSortedChoices.slice(0, this.DEFAULT_OPTIONS_SHOWN);
     } else {
       sortedChoices = allSortedChoices
     }

     var showLink = "";
     if (sortedChoices.length < allSortedChoices.length) {
       showLink = <a href="#" onClick={this.showAll}>Show more</a>;
     } else if (sortedChoices.length > this.DEFAULT_OPTIONS_SHOWN) {
       showLink = <a href="#" onClick={this.showLess}>Show less</a>;
     }

     var options = _.map(sortedChoices, function(arr) {
        var name = arr[0];
        var num = arr[1];
        var checked = Boolean(self.props.selectedFilters[name]);
        return <FilterOption
          key={title + name}
          title={title}
          checked={checked}
          value={name}
          num={num}
          disabled={false}
          handleChange={self.props.handleChange}
        />
     });

     // Find any selected filters that now have 0 results. We will show these grayed out to the user.
     var allChoices = this.props.choices;
     var extraNames = _.pick(this.props.selectedFilters, function(checked, name) {
        return (checked && !_.has(allChoices, name));
     });

     var extraOptions = _.map(extraNames, function(checked, name) {
       return <FilterOption
          key={title + name}
          title={title}
          checked={true}
          value={name}
          num={0}
          disabled={true}
        />
     });

     // Add the new elements to the options list
     options.push.apply(options, extraOptions);

     return <div>
        <span>
          <h4 className="filter-header">{title}</h4>
          <a href="#" className="clear-all" onClick={this.clearAll}>Clear all</a>
        </span>
        {options}
        {showLink}
     </div>;
  }
});

var FilterOption = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired,
    num: React.PropTypes.number.isRequired,
    checked: React.PropTypes.bool.isRequired,
    disabled: React.PropTypes.bool.isRequired,
    handleChange: React.PropTypes.func,
  },

  handleClick: function(event) {
    this.props.handleChange(this.props.title, this.props.value, event.target.checked)
  },

  render: function() {
    var props = this.props
    var classes = props.disabled ? "disabled" : "";

    return <div className="checkbox">
      <label className={classes}>
        <input type="checkbox" name={props.title} value={props.value}
          checked={props.checked} disabled={props.disabled}
          onChange={this.handleClick}/>
        {props.value} ({props.num})
      </label>
    </div>;
  }
});