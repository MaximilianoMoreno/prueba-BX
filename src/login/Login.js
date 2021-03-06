import React, { Component } from 'react';
import './Login.css';
import AuthService from './Auth.service';


class Login extends Component {
  constructor(){
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.Auth = new AuthService();
  
  }
  render() {
    return (
        <div className="center">
          <div className="card">
            <h1>Login</h1>
            <form onSubmit={this.handleFormSubmit}>
              <input
                  className="form-item"
                  placeholder="Ingrese su usuario..."
                  name="email"
                  type="text"
                  onChange={this.handleChange}
              />
              <input
                  className="form-item"
                  placeholder="Ingrese su password"
                  name="password"
                  type="password"
                  onChange={this.handleChange}
              />
              <input
                  className="form-submit"
                  value="Login"
                  type="submit"
              />
            </form>
          </div>
        </div>
    );
  }
  
  componentWillMount(){
    if(this.Auth.loggedIn())
      this.props.history.replace('/');
  }
  
  handleChange(e){
    this.setState(
        {
          [e.target.name]: e.target.value
        }
    )
  }
  
  handleFormSubmit(e){
    e.preventDefault();
    
    this.Auth.login(this.state.email,this.state.password)
        .then(res =>{
          this.props.history.replace('/');
        })
        .catch(err =>{
          alert(err);
        })
  }
}

export default Login;