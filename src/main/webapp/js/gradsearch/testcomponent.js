/** @jsx React.DOM */
var HelloWorld = React.createClass({
  render: function() {
    return (
      <div className="hello">
        Hello {this.props.name}!
      </div>
    );
  }
});