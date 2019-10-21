/* eslint-disable no-unused-vars */
import '../styles/main.css';

/**
 * IndexedDB notes
 * ---------------
 * FACTS
 *
 * - Is a full database;
 * - That can store Arrays, object, images and videos;
 * - It contains structured data, indexed with a key;
 * - It is object oriented with a key/value pair;
 * - Operations are done asynchronously
 *
 * SUPPORT
 *
 * https://caniuse.com/#feat=indexeddb
 *
 * LIMITATIONS
 *
 * - It can's synchronize with a server
 * - Data can we wiped out...
 * - Browser in private mode will not store the data
 * - There is a max amount of quota (different from browser)
 *
 * For more information: https://www.youtube.com/watch?v=vCumk1sXHcY
 */

// Localstorage
const btnAddLocalStorage = document.getElementById('btnAddLocalStorage');

// Sessionstorage
const btnAddSessionStorage = document.getElementById('btnAddSessionStorage');

// IndexedDB
const btnIndexedDbAddPost = document.getElementById('btnIndexedDbAddPost');
const txtIndexedDbTitle = document.getElementById('txtIndexedDbTitle');
const txtIndexedDbContent = document.getElementById('txtIndexedDbContent');
const indexedDBData = document.getElementById('indexedDBData');

/**
 * Variables
 */

let myIndexedDB;

/**
 * IndexedDB
 */

// delete post
const deletePost = (e) => {
  // get my post node
  const postsNode = e.target.parentNode.parentNode.parentNode;
  const currentPostNode = e.target.parentNode.parentNode;

  // get the post id
  const postId = Number(currentPostNode.getAttribute('data-post-id'));

  // create a transaction
  const transaction = myIndexedDB.transaction(['posts'], 'readwrite');

  // get the posts store
  const postsStore = transaction.objectStore('posts');

  // do the delete request
  postsStore.delete(postId);

  // when the transaction was complete
  transaction.addEventListener('complete', () => {
    postsNode.removeChild(currentPostNode);
  });
};

// display posts
const displayPosts = () => {
  // remove all the current indexedDB data
  while (indexedDBData.firstChild) indexedDBData.removeChild(indexedDBData.firstChild);

  // get the posts store
  const postsStore = myIndexedDB.transaction(['posts']).objectStore('posts');

  // open the cursor and loop over data
  postsStore.openCursor().addEventListener('success', (e) => {
    // get the cursor
    const cursor = e.target.result;

    // while we have a cursor
    if (cursor) {
      // create an indexedDBPost
      const indexedDBPost = document.createElement('div');
      indexedDBPost.className = 'indexedDbPost';
      indexedDBPost.setAttribute('data-post-id', cursor.value.id);

      // add a title
      const indexedDBTitle = document.createElement('h2');
      indexedDBTitle.textContent = cursor.value.title;
      indexedDBPost.appendChild(indexedDBTitle);

      // create a content section
      const indexedDBPostContent = document.createElement('div');
      indexedDBPostContent.className = 'indexedDbPostContent';
      indexedDBPostContent.textContent = cursor.value.content;

      // create a delete button
      const indexedDBPostDelete = document.createElement('div');
      indexedDBPostDelete.className = 'indexedDbPostDelete';
      const btnIndexedDbPostDelete = document.createElement('button');
      btnIndexedDbPostDelete.textContent = 'Remove Post';
      btnIndexedDbPostDelete.addEventListener('click', deletePost);
      indexedDBPostDelete.appendChild(btnIndexedDbPostDelete);

      // add to the indexedDBPost container
      indexedDBPost.appendChild(indexedDBTitle);
      indexedDBPost.appendChild(indexedDBPostContent);
      indexedDBPost.appendChild(indexedDBPostDelete);

      // add the post to our indexedDBData
      indexedDBData.appendChild(indexedDBPost);

      // let our cursor continue
      cursor.continue();
    }
  });
};

// add a post to our db
const addPost = (e) => {
  // prevent default behaviour
  e.preventDefault();

  // create a new object to store
  const newPost = {
    title: txtIndexedDbTitle.value,
    content: txtIndexedDbContent.value,
  };

  // create a transaction
  const transaction = myIndexedDB.transaction(['posts'], 'readwrite');

  // get the posts store
  const postsStore = transaction.objectStore('posts');

  // do the add request
  const request = postsStore.add(newPost);

  // when we have successfully done the request,
  // remove the content from our form fields
  request.addEventListener('success', () => {
    txtIndexedDbTitle.value = '';
    txtIndexedDbContent.value = '';
  });

  // when the transaction was complete
  transaction.addEventListener('complete', () => {
    console.log('Transaction completed!');
    displayPosts();
  });

  // when there was an error in our transaction
  transaction.addEventListener('error', () => {
    console.log('Transaction went wrong...');
  });
};

// initialize the database
const initIndexedDb = () => new Promise((resolve, reject) => {
  // open my database
  const request = indexedDB.open('blog', 1);

  // add error handler
  request.addEventListener('error', (err) => reject(err.message));

  // add success handler
  request.addEventListener('success', () => {
    console.log('Database opened successfully!');
    resolve(request.result);
  });

  // add upgradeneeded
  request.addEventListener('upgradeneeded', (evt) => {
    // get the database
    const myDb = evt.target.result;

    // Create an objectStore to hold information about our posts. We're
    // going to use "id" as our key path that will generated automatically
    const postsStore = myDb.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });

    // Define the posts data
    // var myIDBIndex = objectStore.createIndex(indexName, keyPath);
    // var myIDBIndex = objectStore.createIndex(indexName, keyPath, objectParameters);
    postsStore.createIndex('title', 'title', { unique: false });
    postsStore.createIndex('content', 'content', { unique: false });

    // setup complete
    console.log('Database setup complete');
  });

  // return the request
  return request;
});

/**
 * My app
 */

const initApp = () => {
  /**
   * Localstorage
   */

  btnAddLocalStorage.addEventListener('click', (e) => {
    localStorage.setItem('hello', 'localStorage world!');
  });

  /**
   * Sessionstorage
   */

  btnAddSessionStorage.addEventListener('click', (e) => {
    sessionStorage.setItem('hello', 'sessionStorage world!');
  });

  /**
   * IndexedDB
   */

  // init the indexeddb
  initIndexedDb().then((myDb) => {
    // make the database internal
    myIndexedDB = myDb;

    // display posts
    displayPosts();
  });

  // add post
  btnIndexedDbAddPost.addEventListener('click', addPost);
};

// start my app
initApp();
