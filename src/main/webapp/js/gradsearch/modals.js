/** @jsx React.DOM */

/**
 * The div that might show a prof modal
 */
var ModalDiv = React.createClass({
  propTypes: {
    currentProf: React.PropTypes.object,
    showNextProf: React.PropTypes.func,
  },

  componentDidUpdate: function(prevProps) {
    if (this.props.currentProf != null) {
      $('#profModal').modal('show')
    }
  },

  render: function() {
    if (this.props.currentProf == null) {
      return <div/>;
    }

    return <div className="modal fade" id="profModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
            <h4 className="modal-title" id="myModalLabel">{this.props.currentProf.name}</h4>
          </div>
          <div className="modal-body">
            <p>{this.props.currentProf.school}</p>
            <p>{this.props.currentProf.department}</p>
            <p>{this.props.currentProf.keywords}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default"
                onClick={_.partial(this.props.showNextProf, "prev")}>
              Previous
            </button>
            <button type="button" className="btn btn-default"
                onClick={_.partial(this.props.showNextProf, "next")}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  }
});

