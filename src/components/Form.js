import React, { Component } from 'react';
import '../App.css';
import axios from 'axios';
import _ from 'underscore';
import Filter from 'bad-words';
import swal from 'sweetalert';
import Mousetrap from 'mousetrap';

// IMAGES
import LoveIcon from '../assets/cupid.svg';
import YogaIcon from '../assets/yoga.svg';
import ApocalypseIcon from '../assets/apocalypse.svg';
import AstrologyIcon from '../assets/astrology.svg';
import ShakespeareIcon from '../assets/shakespeare.svg';
import OdeLogo from '../assets/odeLogo.svg';

//empty wordlist that gets populated with words on submit of form
let wordList = []

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queryInput: '',
      autoSuggest: [],
      wordList: [],
      topic: '',
    }
  }
  
  componentDidMount() {

  Mousetrap.bind(['* k', 'ctrl+r', `up up down down left right left right b a enter`], this.getSwears);
    
  }

  // function makes an api call for auto suggestions and returns a promise
  suggestionQuery = (input) => {
    return axios.get(`https://api.datamuse.com/sug?s=${input}`)
  }

  handleChange = (e) => {
    // To make this function generic, set the changed input's key to be its id and value to be its value.
    this.setState({
      [e.target.id]: e.target.value,
    })

    // On change && only if the target's id is the queryValue && there is no word evaluted as a swear word, query the api for suggestions using the event target's value as the input
    if (e.target.id === "queryInput" && !this.profanityFilter(e.target.value)) {

      _.throttle(this.suggestionQuery(e.target.value)
        .then(({ data }) => {
          // map over the suggestions, returning an array of just the words
          const autoSuggest = data.map((word) => {
            return word.word
          })
          // change state of our auto suggestions and make sure the every time a query is made, we reset our clicked suggestion
          this.setState({
            autoSuggest
          })
        }).catch(console.log),1000);
    } else {
      swal("You can't swear here", "naughty naughty!", "error");
      this.setState({
        queryInput: '',
      })
    }

  }

  toggleRadio = (e) => {
    // If a topic has been selected already and if e.target is a radio button...
    if (this.state.topicSelected && e.target.type === "radio" ){
      // uncheck the input
      e.target.checked = false

      // change state to reflect a topic being unselected
      this.setState({
        topicSelected: false,
        queryInput: '',
      })
    //  if a topic has not been selected...
    } else if (e.target.type === "radio" ){

      // set the input that was clicked to checked
      e.target.checked = true;

      // change state to reflect that a topic has been selected
      this.setState({
        topicSelected: true,
        queryInput: e.target.value,
      })
    }
  }

  getElementOnClick = (e) => {
    this.setState({
      queryInput: e.target.innerHTML,
    })
  }

  // a function that evaluates a string for any profanity 
  profanityFilter = (input) => {
    // create a new profanity filter that replaces swear words with spaces
    const filter = new Filter({ placeHolder: ' ' })
    // run our input through the clean method to evaluate it, trimming any whitespace
    const clean = filter.isProfane(`${input}`)
    return clean
  }

  // Make an api call to get words from an input - returns a promise
  getWordsQuery = (queryType, input, num) => {
    return axios.get(`https://api.datamuse.com/words?${queryType}=${input}&max=${num}`)
  }
  // take our api calls, and format,collect and reduce the results to a single array
  getWordList = (queryType, num, ) => {
    return this.getWordsQuery(queryType, this.state.queryInput, num)
  }

  getVerbs = (queryType, input, num) => {
    return axios.get(`https://api.datamuse.com/words?${queryType}=${input}&max=${num}&md=p`).then(({ data }) => {

      // filter for verbs
      const verbs = data.filter((word) => {
        return word.tags && word.tags.includes('v')

      })
      //get array of just the words
      verbs.slice(0, 10).map((word) => {
        wordList.push(word.word.toLowerCase())
      });
      this.setState({
        wordList,
      }, () => {
        const shuffledWords = _.shuffle(wordList);
        const duplicateFree = _.uniq(shuffledWords)
        this.props.passChildState('wordList', duplicateFree)
        this.props.history.push("/fridge")
      })
      

    })
  }

  // make api calls, pass wordlist to state
  setWordList = () => {
    wordList = ['or', 'if', 'the', 'a', 'it', 'does', 'they', 'their', 'his', 'her', 'and', 'our', 'out', 'we', 'in', 'to', 'too', 'me', 'ly', 'ing', 'd', 'ed', 'ful', 'y', 'anti', 'un', 're', '!', '?']
    console.log(wordList);

    // A conditional to get us shakespearean words
    if(this.state.queryInput === "Shakespeare"){
      wordList = ['if', 'the', 'a', 'it', 'ly', 'ing', 'd', 'ed', 'ful', 'y', 'anti', 'un', 're', '!', '?', 'his', 'her']
      this.getWordsQuery('rel_trg', 'thou', 15).then(({data}) => {
        data.map((word) => wordList.push(word.word.toLowerCase()))
        console.log(wordList);
      })
    }
    
    Promise.all([
      this.getWordList('ml', 7),
      this.getWordList('rel_trg', 6),
      this.getWordList('rel_jjb', 6),
      this.getWordList('rel_rhy', 5),
      this.getWordList('rel_bga', 3),
      this.getWordList('rel_bgb', 3),
      this.getWordList('rel_spc', 3),
      this.getWordList('rel_gen', 3),

    ]).then((res) => {
      res.map(({ data }) => {
        
        data.map(({ word }) => {
          
          wordList.push(word)
        })
      })
      this.getVerbs('ml', this.state.queryInput, '300')
    })
  }

  getSwears = () => {
    //setState to an input and call setWordList()
    this.setState({
      queryInput: 'fuck',
    }, () => {
      this.setWordList();
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (!this.state.queryInput) {
      return swal('To make a poem, you need to enter a word in, silly!')
    } else {
      this.setWordList()
    }
    this.setState({
      autoSuggest: [],
    })
  }

  render() {
    return (
      <section className="main-form clearfix">
        <header>
          <img src={OdeLogo} alt="An ode to magnetic fridge poems" className="logo"/>
          <h1>Magnetic Poetry</h1>
        </header>
        <form onSubmit={this.handleSubmit}>
          <div className="search-container">
            <div className="search-bar clearfix">
                  <input id="queryInput" onChange={this.handleChange} type="text" name="" value={this.state.queryInput} placeholder="Enter a poem topic" readOnly={this.state.topicSelected ? true : false}/>
                  <label className="visuallyhidden" htmlFor="queryInput">
                    <h3>Enter a poem topic to get words</h3>
                  </label>
                  <button className="search-words" type="submit">Give me Words</button>
            </div>
              {this.state.queryInput ?
                <ul>
                  {
                    this.state.autoSuggest.map((word, i) => {
                      return (
                        <li className="show" onClick={this.getElementOnClick} key={i}>{word}</li>
                        )
                      })
                    }
                </ul> : null}
          </div>
          <div className="topic-container">
            <h3 className="row">or pick one of ours...</h3>
            <fieldset className="category-options clearfix">

              <input onBlur={this.handleChange} onClick={this.toggleRadio} type="radio" name="category" value="Shakespeare" id="shakespeare" />
              <label htmlFor="shakespeare">
                <img src={ShakespeareIcon} alt="Make a poem based on the 'Shakespeare' topic" />
                <h3>Shakespeare</h3>
              </label>

              <input onBlur={this.handleChange} onClick={this.toggleRadio} type="radio" name="category" value="Love" id="love" />
              <label htmlFor="love">
                <img src={LoveIcon} alt="Make a poem based on the 'Love' topic"/>
                <h3>Love</h3>
              </label>

              <input onBlur={this.handleChange} onClick={this.toggleRadio} type="radio" name="category" value="Yoga" id="yoga" />
              <label htmlFor="yoga">
                <img src={YogaIcon} alt="Make a poem based on the 'Yoga' topic" />
                <h3>Yoga</h3>
              </label>

              <input onBlur={this.handleChange} onClick={this.toggleRadio} type="radio" name="category" value="Astrology" id="astrology" />
              <label htmlFor="astrology">
                <img src={AstrologyIcon} alt="Make a poem based on the 'Astrology' topic" />
                <h3>Astrology</h3>
              </label>

              <input onBlur={this.handleChange} onClick={this.toggleRadio} type="radio" name="category" value="Apocalypse" id="apocalypse" />
              <label htmlFor="apocalypse">
                <img src={ApocalypseIcon} alt="Make a poem based on the 'Apocalypse' topic" />
                <h3>Apocalypse</h3>
              </label>
            </fieldset>

          </div>
        </form>
        <footer>
          Made by
              <a href="http://www.ashleyhellyer.com"> Ashley </a>
          &
               <a href="http://www.shaikirmanicodes.com"> Shai </a>
          &
               <a href="http://www.spen.io"> Spencer </a>
          2018 &copy;
          </footer>
      </section>
    )
  }
}

export default Form;