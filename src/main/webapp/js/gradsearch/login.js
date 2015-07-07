/** @jsx React.DOM */
var React = require("react/addons");
var Login = React.createClass({

  getInitialState: function() {
  	return {username: "", password: "", passwordRepeat: "", usernameValid: false};
  },

  updateState: function(name, value) {
  	var d = {};
  	d[name] = value;
  	this.setState(d);
  },

  isValid: function() {
  	return (this.state.usernameValid && 
  			this.passwordValidator(this.state["password"]) == "" && 
  			this.passwordRepeatValidator(this.state["passwordRepeat"]) == "" );
  },

  // TODO: add username checking + the ability to do affirmative
  usernameValidator: function(username, callback) {
  	var self = this;
  	$.get("/is-available?username=" + username, function(data) {
  		if (data == false) {
  			self.setState({"usernameValid": false});
  			callback("Sorry, that email is already in use");
  	
  		} else {
  			self.setState({"usernameValid": true});
  			callback("");
  		}
  	});
  },

  passwordValidator: function(password) {
  	if (password.length < 5) {
  		return "Password is too short";
  	} else {
  		return "";
  	}
  },

  passwordRepeatValidator: function(passwordRepeat) {
  	if (passwordRepeat != this.state.password) {
  		return "Passwords don't match";
  	} else {
  		return "";
  	}
  },

  render: function() {
  	var valid = this.isValid();
    return (
      <div>
	      <Validator name="username" placeholder="Email Address" type="text"
	      	onBlurValidator={this.usernameValidator} updateHandler={this.updateState}/>
	      <Validator name="password" type="password" className="form-control" placeholder="Password" required 
	      	onBlurValidator={this.passwordValidator} updateHandler={this.updateState}/>
	      <Validator name="passwordRepeat" type="password" className="form-control" placeholder="Re-enter password" required 
	      	onKeyUpValidator={this.passwordRepeatValidator} updateHandler={this.updateState}/>
	      <button className="btn btn-lg btn-primary btn-block" type="submit" disabled={!valid}>Create account</button>
      </div>
    );
  }
});

var Validator = React.createClass({
	propTypes: {
	    name: React.PropTypes.string.isRequired,
	    placeholder: React.PropTypes.string.isRequired,
	    onBlurValidator: React.PropTypes.func,
	    onKeyUpValidator: React.PropTypes.func,
	    updateHandler: React.PropTypes.func
  	},
	getInitialState: function() {
		return {value: "", validationMessage: ""}
	},

	handleChange: function(event) {
		if (this.props.updateHandler) {
			this.props.updateHandler(this.props.name, event.target.value);
		}
		if (this.props.onKeyUpValidator) {
			var validationMessage = this.props.onKeyUpValidator(event.target.value);
			this.setState({validationMessage: validationMessage});
		}
		this.setState({value: event.target.value});
	},

	handleBlur: function(event) {
		var self = this;
		if (this.props.onBlurValidator) {
			this.props.onBlurValidator(this.state.value, function(validationMessage) {
				self.setState({value: self.state.value, validationMessage: validationMessage});
			});
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

module.exports = Login;