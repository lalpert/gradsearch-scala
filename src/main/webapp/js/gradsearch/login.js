/** @jsx React.DOM */
var Login = React.createClass({

  getInitialState: function() {
  	return {username: "", password: "", passwordRepeat: "", valid: false};
  },

  updateState: function(name, value) {
  	var state = this.state;
  	state[name] = value; 	 	
  	this.updateIsValid(state); 
  	this.setState(state);
  },

  updateIsValid: function(state) {
  	if (this.usernameValidator(state["username"]) == "" && 
  			this.passwordValidator(state["password"]) == "" && 
  			this.passwordRepeatValidator(state["passwordRepeat"]) == "") {
  		state["valid"] = true;
  	} else {
  		state["valid"] = false;
  	}
  },

  // TODO: add username checking + the ability to do affirmative
  usernameValidator: function(username) {
  	$.get("/is-available?username=" + username, function(data) {
  		if (data == false) {
  			return "Sorry, that email is already in use";
  		} else {
  			return "";
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
    return (
      <div>
	      <Validator name="username" placeholder="Email Address" type="text"
	      	onBlurValidator={this.usernameValidator} updateHandler={this.updateState}/>
	      <Validator name="password" type="password" className="form-control" placeholder="Password" required 
	      	onBlurValidator={this.passwordValidator} updateHandler={this.updateState}/>
	      <Validator name="passwordRepeat" type="password" className="form-control" placeholder="Re-enter password" required 
	      	onKeyUpValidator={this.passwordRepeatValidator} updateHandler={this.updateState}/>
	      <button className="btn btn-lg btn-primary btn-block" type="submit" disabled={!this.state.valid}>Create account</button>
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
		var validationMessage = "";
		if (this.props.onKeyUpValidator) {
			validationMessage = this.props.onKeyUpValidator(event.target.value);
		}
		if (this.props.updateHandler) {
			this.props.updateHandler(this.props.name, event.target.value);
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