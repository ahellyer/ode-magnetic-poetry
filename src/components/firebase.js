import firebase from 'firebase';

var config = {
    apiKey: "AIzaSyCpgraPWXILaj3lB88D6GelM60pcsFlnD0",
    authDomain: "magnet-poetry.firebaseapp.com",
    databaseURL: "https://magnet-poetry.firebaseio.com",
    projectId: "magnet-poetry",
    storageBucket: "magnet-poetry.appspot.com",
    messagingSenderId: "573163146964"
};
firebase.initializeApp(config);

export default firebase