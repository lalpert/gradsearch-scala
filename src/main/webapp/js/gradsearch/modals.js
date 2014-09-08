/** @jsx React.DOM */

/**
 * The div that might show a prof modal
 */
var ModalDiv = React.createClass({
  propTypes: {
    currentProf: React.PropTypes.object,
    showNextProf: React.PropTypes.func,
    hideModal: React.PropTypes.func,
  },

  componentDidUpdate: function(prevProps) {
    var self = this;
    if (this.props.currentProf != null && prevProps.currentProf == null) {
      $('#profModal').modal('show');
      self.addKeyBinding();

      // TODO: don't bind this on every component did update...some tricks mentioned include setting a css class on it.
      $('#profModal').bind('hidden.bs.modal', function (e) {
        self.props.hideModal();
        self.removeKeyBinding();
      });
    } 
  },

  addKeyBinding: function() {
    var self = this;
    console.log("binding");
    $(document).bind("keydown", function(e) {
      var left = 37;
      var right = 39;
      var escape = 27;
      if (e.keyCode == right) {
        self.props.showNextProf("next");
      } else if (e.keyCode == left) {
        self.props.showNextProf("prev");
      } else if (e.keyCode == escape) {
        $('#profModal').modal('hide');
      }
    });    
  },

  removeKeyBinding: function() {
    console.log("unbinding");
    $(document).unbind('keydown');
  },

  render: function() {
    if (this.props.currentProf == null) {
      return <div/>;
    }

    return <div className="modal fade" id="profModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div className="modal-dialog" onKeyPress={this.hello}>
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span className="sr-only">Close</span></button>
            <h4 className="modal-title" id="myModalLabel">{this.props.currentProf.name}</h4>
          </div>
          <div className="modal-body prof-modal-body">
           
            <img className="pull-left media-object prof-image prof-pic" src={this.props.currentProf.image} alt="Generic placeholder image"/>
            
            <p>{this.props.currentProf.school}</p>
            <p>{this.props.currentProf.department}</p>
            <strong>Research Interests:</strong>
            <p>{this.props.currentProf.keywords.join(", ")}</p>
            <hr/>
            <div dangerouslySetInnerHTML={{__html: this.props.currentProf.bio}} />
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

