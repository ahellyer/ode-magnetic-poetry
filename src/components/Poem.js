import React, { Component } from 'react';
import firebase from './firebase';
import OdeLogo from '../assets/odeLogo.svg';


class Poem extends Component {
  constructor(){
    super()
    this.state = {
      poemArray: [],
    }
  }

  componentDidMount = () => {
    //get firebase key from the poem url
    const fullPath = this.props.location.pathname;
    const poemKey = fullPath.split('/')[2];
    const dbRef = firebase.database().ref(`/${poemKey}`);
    dbRef.once('value').then((snapshot) => {
      console.log('getting snapshot')
      return (snapshot.val())
    }).then((data)=> {
      this.setState({
        poemArray: data,
      })
    })
  }

  makeYourOwn = () => {
    
    this.props.passChildState('wordList', []);
    this.props.history.push('/');
    
  }

  render() {
  return (
    <section className="poem-page">
      <header className="poem-header clearfix">
        <h1 className="poem-logo"><img src={OdeLogo} alt="An ode to magnetic fridge poems" className="logo" /></h1>
        <nav className="poem-nav clearfix">
          <button className="make-own" onClick={this.makeYourOwn}>Make Your Own</button>
        </nav>
        <p>...an app that pays tribute to the magnetic poetry kits of your childhood</p>
      </header>
      <div className="fridge-container">
        <ul>
          {this.state.poemArray.map( (data, i) => {
            return (
            <li className="show" key={i}> {data} </li>
            )}
          )}
        </ul>
      </div>
    </section>
  )
}
}

export default Poem;