import React, { Component } from 'react';
import firebase from 'firebase';
import { Link } from 'react-router-dom';

import OdeLogo from '../assets/odeLogo.svg';

let poemsArray = [];

class Gallery extends Component {
    constructor(){
        super()
        this.state = {
            poems: []
        }
    }

    componentDidMount(){
        //get data from firebase
        firebase.database().ref().on('value', (snapshot) => {
            //snapshot of database
            if (snapshot.val()) {
                //send the firebase data to updatePoems function 
                this.updatePoems(snapshot.val());
            } else {
                this.setState({
                    poems: []
                })
            }
        })
    }

    updatePoems = (poems) => {

        Object.entries(poems).map((poems) => {
            console.log(poems[1]);
            return (
                
                poemsArray.push(poems[1])
            )
        })

        this.setState({
            poems: poemsArray
        })
    }

    render(){
        return (
            <div>
                <header className="gallery-header clearfix">
                    <h1 className="poem-logo"><img src={OdeLogo} alt="An ode to magnetic fridge poems" className="logo" /></h1>
                    <nav className="gallery-nav clearfix">
                        <Link to="/" className="home-link">Home</ Link>
                    </nav>
                </header>
                <div className="list-holder">
                            
                    {this.state.poems.map((item) => {
                        return (
                            <ul>{item.map((word) => {
                                return(
                                    <li class="show">{word}</li>
                                )
                            })}</ul>
                        )
                    })}
                </div>
            </div>
           
        )
    }
}

export default Gallery;


