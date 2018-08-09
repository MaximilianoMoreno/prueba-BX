import React, {Component} from 'react';
import NumericInput from 'react-numeric-input';
import './Converter.css';
import CONSTANTS from './constants';

const _ = require('lodash');

class Converter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: 1,
      conversionValue: undefined,
      selectFromCurrency: "EUR",
      selectToCurrency: "USD"
    };
  }
  
  handleSubmitClick = (event) => {
    fetch('/api/v1/latest?baseCurrency=' + this.state.selectFromCurrency + '&toCurrency=' + this.state.selectToCurrency)
        .then(results => {
          return results.json();
        }).then(data => {
          let rate = _.get(data.rates, 'USD') || 1;
          this.setState({
            conversionValue: this.state.inputValue * rate
          });
      
        });
  };
  
  updateInputValue(evt) {
    this.setState({
      inputValue: evt
    });
  }
  
  render() {
    let fromSymbol = getCurrencySymbol(this.state.selectFromCurrency);
    let toSymbol = getCurrencySymbol(this.state.selectToCurrency);
    
    function getCurrencySymbol(currency) {
      return _.get(CONSTANTS, currency);
    }
    
    function fromFormat(num) {
      return fromSymbol + ' ' + num;
    }
    
    function toFormat(num) {
      return toSymbol + ' ' + num;
    }
    
    
    return (
        <div className="converter-section">
          <form className="card" onSubmit={this.handleFormSubmit}>
            <select className="item" name="selectCurrency" id="selectCurrency" disabled={true}>
              <option value={this.state.selectFromCurrency}>{this.state.selectFromCurrency} </option>
            </select>
            <NumericInput
                min={0} precision={4}
                value={this.state.inputValue} step={1}
                format={fromFormat}
                onChange={evt => this.updateInputValue(evt)}
            />
            <select className="item" name="selectCurrency" id="selectCurrency">
              <option value={this.state.selectToCurrency}> {this.state.selectToCurrency} </option>
            </select>
            
            <NumericInput
                min={0} precision={4}
                value={this.state.conversionValue}
                disabled={true}
                format={toFormat}
            />
            
            <input
                className="form-submit"
                onClick={this.handleSubmitClick}
                type="submit"
                value="Convert..."
            />
          </form>
        
        </div>
    );
  }
  
  handleFormSubmit(e) {
    e.preventDefault();
  }
}

export default Converter;
