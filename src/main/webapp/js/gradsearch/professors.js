/** @jsx React.DOM */

/**
 * Section containing boxes for all profs
 */
var ProfSection = React.createClass({
  propTypes: {
    profArray: React.PropTypes.array,
    showModal: React.PropTypes.func,
    setStarred: React.PropTypes.func,
  },

  render: function() {
    var props = this.props;
    allProfs = this.props.profArray.map(function(prof) {
      return <ProfBox
        profData={prof}
        key={prof.id}
        showModal={props.showModal}
        setStarred={props.setStarred}
      />;
    });

    return <div className="row">
      {allProfs}
    </div>;
  }
});

var ProfBox = React.createClass({
  propTypes: {
    profData: React.PropTypes.object.isRequired,
    showModal: React.PropTypes.func.isRequired,
    setStarred: React.PropTypes.func.isRequired,
  },

  handleClick: function() {
    this.props.showModal(this.props.profData.id);
  },

  setStarred: function(event) {
    event.stopPropagation();
    this.props.setStarred(this.props.profData.id, !this.props.profData.starred)
  },

  formatKeywords: function(keywords) {
    return _.first(keywords, 3).join(", ");
  },

  render: function() {
    var prof = this.props.profData;
    var starImg = this.props.profData.starred ? "gold_star.png" : "gray_star.png";

    return (
      <div className="col-sm-6 col-lg-4 grid-spacing">
        <div className="thumbnail prof-div" onClick={this.handleClick}>
          <a className="pull-left prof-pic" href="#">
            <img className="media-object" src="http://placehold.it/100x125" alt="Generic placeholder image"/>
          </a>
          <div className="star-div" onClick={this.setStarred}>
            <img src={"/images/" + starImg} height="20px"/>
          </div>
          <div className="prof-info">
              <div>
                <h4 className="media-heading">{this.props.profData.name}</h4>
                <p>{prof.school}</p>
                <p>{prof.department}</p>
              </div>
          </div>
          <hr className="prof-hr"/>
          <div className="prof-keywords">
            <p>{this.formatKeywords(prof.keywords)}</p>
          </div>
        </div>
      </div>
    );
  }
});