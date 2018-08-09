import React, { Component } from 'react';
import './Header.css';
import logo from "../currency-exchange.png";

class Header extends Component {
    render() {
        return (
            <header className="App-header">
              <div className="logo-circle">
                <img src={logo} className="App-logo" alt="logo" />
              </div>
      
              <h1 className="App-title">moneyxchange.io</h1>
            </header>
        );
    }
}

export default Header;
