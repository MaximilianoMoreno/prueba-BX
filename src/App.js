import React, {Component} from 'react';
import './App.css';
import Header from "./header/Header";
import Converter from "./converter/Converter";
import AuthService from './login/Auth.service';
import withAuth from './login/withAuth';
const Auth = new AuthService();

class App extends Component {
  render() {
    return (
        <div className="App center">
          <div className="App card">
  
            <Header/>
            <h2>Welcome {this.props.user.nombre}</h2>
            <Converter/>
            <p className="App-intro">
              <button type="button" className="form-logout" onClick={this.handleLogout.bind(this)}>Logout</button>
            </p>
          </div>
          
         
        </div>
    );
  }
  
  handleLogout(){
    Auth.logout();
    this.props.history.replace('/login');
  }
}

export default withAuth(App);
