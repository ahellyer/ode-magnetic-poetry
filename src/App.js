import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// COMPONENTS
import Form from './components/Form';
import Poem from './components/Poem';
import Fridge from './components/Fridge';

class App extends Component {
  constructor() {
    super();
    this.state = {
      wordList: [],
      show: 'show',
      hide: 'hide',
      selectedWords: [],
    }
  }
  
  //general function for passing info from child component to App
  passChildState = (key, val) => {
    this.setState({
      [key]: val,
    })
  }

  render() {
    return (
      <Router>
        <div className="App">
          <div className="wrapper">
            <main className="main-section">
              <Route exact path="/" render={(props) =>
                <Form {...props} passChildState={this.passChildState} queryInput={this.state.queryInput} />
              }/>

              <Route exact path="/fridge" render={(props) =>
                <Fridge {...props} wordList={this.state.wordList} passChildState={this.passChildState}/>
              }/>

              <Route path="/poem/:poemKey" render={(props) =>
                <Poem {...props} selectedWords={this.state.selectedWords} passChildState={this.passChildState}/>}
              />
            </main>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;