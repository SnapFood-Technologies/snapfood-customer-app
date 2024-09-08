import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyC5UQhb8CRsCehJpxUyMqZ22kX5ql8fLzI',
    projectId: 'snapfood-3f623',
    authDomain: 'snapfood-3f623.firebaseapp.com',
    databaseURL: 'https://snapfood-3f623.firebaseio.com',
};


firebase.initializeApp(firebaseConfig);

export const FieldValue = firebase.firestore.FieldValue;

export default firebase.firestore();
