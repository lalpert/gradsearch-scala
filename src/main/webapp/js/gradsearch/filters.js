/** @jsx React.DOM */

/**
 * Filter bar on the left of the search page that lets users filter by starred, university, and department.
 */
var FilterBar = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
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
      />
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