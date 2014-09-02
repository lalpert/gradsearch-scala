/** @jsx React.DOM */

/**
 * Filter bar on the left of the search page that lets users filter by starred, university, and department.
 */
var FilterBar = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    clearSection: React.PropTypes.func.isRequired,
    filterOptions: React.PropTypes.array.isRequired,
    selectedFilters: React.PropTypes.object.isRequired,
    numStarred: React.PropTypes.number.isRequired
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
    var starred = {"Starred": this.props.numStarred}

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

     var temp = 0
     var options = _.map(sortedChoices, function(arr) {
        temp++;
        var name = arr[0];
        var num = arr[1];
        var checked = Boolean(self.props.selectedFilters[name]);
        return <FilterOption
          key={title + name + temp}
          title={title}
          checked={checked}
          value={name}
          num={num}
          handleChange={self.props.handleChange}
        />
     });

     return <div>
        <span>
          <h4 className="filter-header">{title}</h4>
          <a href="#" className="clear-all" onClick={this.clearAll}>Clear all</a>
        </span>
        {options}
        {showLink}
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