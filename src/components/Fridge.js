import React, { Component } from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import firebase from './firebase';
import swal from 'sweetalert';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import OdeLogo from '../assets/odeLogo.svg';

//called when an item is moves position in the same list
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

//moves an item from one list to another list
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

//sets style of list item and drop area when dragging
const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  color: isDragging ? '#00000aa' : 'black',
  background: isDragging ? '#f1f1f175' : '#f1f1f1',
  boxShadow: isDragging ? "2px 5px 5px #555" : "2px 5px",
  transition: "border .3s ease-in-out",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#00675033' : '#f1f1f100',
  transition: "background .3s ease-in-out",
  height: '100%',
  border: 'none',
});


class Fridge extends Component{
  constructor(props){
    super(props);
    this.state = {
      wordList: this.props.wordList,
      selectedWords: [],
    }
  }

  id2List = {
    droppable: 'selectedWords',
    droppable2: 'wordList'
  };

  //returns the correct array from state based on which list the item originated from 
  getList = id => this.state[this.id2List[id]];

  onDragEnd = result => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    //if source and destination are the same, reorder that list based on where the item was dropped 
    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );
      //update state with new array order
      let state = { selectedWords: items };

      
      if (source.droppableId === 'droppable2') {
        state = { wordList: items };
      }

      this.setState(state);
    } else {
      //if the source and destination are different the item needs to be moved between the two lists 
      const result = move(
        //where it is coming from
        this.getList(source.droppableId),
        //where it was dropped
        this.getList(destination.droppableId),
        source,
        destination
      );
      //reset with new info 
      this.setState({
        selectedWords: result.droppable,
        wordList: result.droppable2
      });
    }
  }

  sharePoem = (e) => {
    //check to see if there are words in the poem 
    if (this.state.selectedWords.length > 0) {

      this.setState({
        wordList: [],

      }, () => {
        //send words to firebase
        const dbRef = firebase.database().ref();
        this.props.passChildState("selectedWords", this.state.selectedWords)
        this.props.passChildState("wordList", [])

        const poemKey = dbRef.push(this.state.selectedWords).key;
        //update URL path to go to poem component 
        swal("You are a poetic genius.", `Share your poem with all your friends with this URL: www.magnetic-poetry.firebaseapp.com/poem/${poemKey}`);
        this.props.history.push(`/poem/${poemKey}`)
      })

    } else {
      swal("hey you!", "why are you sharing an empty poem?!", "warning");
      
    }

  }

  render() {
    return (
      <section className="fridge">
        <div className="clearfix wrapper">
          <header className="fridge-header header clearfix">
            <h1 className="fridge-logo"><img src={OdeLogo} alt="An ode to magnetic fridge poems" className="logo"/></h1>
            <nav className="fridge-nav nav clearfix">
              <Link to="/" className="home-link">Home</ Link>
              <button className="share-poem" onClick={this.sharePoem}>Share Poem</button>
            </nav>
          </header>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <div className="poem-dashboard">
              <p>Drag and drop me on the fridge!</p>
              <Droppable droppableId="droppable2">
                {(provided, snapshot) => (
                  <ul
                    id="word-list"
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}>
                    {

                      this.state.wordList.map((item, index) => (
                        <Draggable
                          key={item}
                          draggableId={item}
                          index={index}>
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                              className="show">
                              {item}
                            </li>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
            <div className="fridge-container" >
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <ul
                    id="fridge-words"
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}>
                    {

                      this.state.selectedWords.map((item, index) => (

                        <Draggable
                          key={item}
                          draggableId={item}
                          index={index}>
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                              className="show">
                              {item}
                            </li>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </div>
      </section>      
    )
  }
}


export default Fridge;