/** @jsx React.DOM */
var Login = React.createClass({

  getInitialState: function() {
  	return {password: ""}
  },

  usernameValidator: function(username) {
  	return "";
  },

  passwordValidator: function(password) {
  	this.setState({password: password});
  	if (password.length < 5) {
  		return "Password is too short";
  	}
  },

  passwordRepeatValidator: function(passwordRepeat) {
  	if (passwordRepeat != this.state.password) {
  		return "Passwords don't match";
  	}
  },

  render: function() {
    return (
      <div>
	      <Validator name="username" placeholder="Email Address" type="text"
	      	onBlurValidator={this.usernameValidator}/>
	      <Validator name="password" type="password" className="form-control" placeholder="Password" required 
	      	onBlurValidator={this.passwordValidator}/>
	      <Validator name="passwordRepeat" type="password" className="form-control" placeholder="Re-enter password" required 
	      	onKeyUpValidator={this.passwordRepeatValidator}/>
	      <button className="btn btn-lg btn-primary btn-block" type="submit">Create account</button>
      </div>
    );
  }
});

var Validator = React.createClass({
	propTypes: {
	    name: React.PropTypes.string.isRequired,
	    placeholder: React.PropTypes.string.isRequired,
	    onBlurValidator: React.PropTypes.func,
	    onKeyUpValidator: React.PropTypes.func
  	},
	getInitialState: function() {
		return {value: "", validationMessage: ""}
	},

	handleChange: function(event) {
		var validationMessage = "";
		if (this.props.onKeyUpValidator) {
			validationMessage = this.props.onKeyUpValidator(this.state.value);
		}	
		this.setState({value: event.target.value, validationMessage: validationMessage});
	},

	handleBlur: function(event) {
		if (this.props.onBlurValidator) {
			var validationMessage = this.props.onBlurValidator(this.state.value);
			this.setState({value: this.state.value, validationMessage: validationMessage});
		}
	},

	render: function() {
		var mainInput = <input name={this.props.name} type={this.props.type} value={this.state.value} 
				className="form-control" placeholder={this.props.placeholder} required autofocus onBlur={this.handleBlur} onChange={this.handleChange}/>;
		
		if (!this.state.validationMessage) {
			return <div>
				{mainInput}
			</div>
			 
		} else {
			return <div>
				{mainInput}
				<div className="alert alert-danger form-control" role="alert">{this.state.validationMessage}</div>
			</div>
		}
	}
});