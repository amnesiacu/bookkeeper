// Bookkeeper ~ Sync Bookmarks
// popup.js
// https://github.com/amnesiacu/bookkeeper

import {Paragraph, Anchor, Span} from './src/utils.js'
import {getHash} from './src/functions.js'

let list = null;
const bookkeeperServer = 'http://localhost:3007';
const headers = new Headers()
  .set('Content-Type', 'application/json');

var remoteBookmarks = new Array();
var localBookmarks = new Array();
var mergedBookmarks = new Array();

const getRemoteBookmarks = () => {
  return new Promise( resolve => {
    fetch(`${bookkeeperServer}/api/bookmark`)
      .then(r => r.json())
      .then(data => {
        data.forEach(bookmark => {
          let x = Object.assign({}, bookmark)
          remoteBookmarks.push({
            title: x.title,
            url: x.url,
            uid: getHash(`${bookmark.title}-${bookmark.url}`)
          })
        })
        resolve()
      })
      .catch(e => console.log("Errrrr", e))
  })
}

const flattenTree = (tree) => {
  if (Array.isArray(tree)) {
    tree.forEach( node => {
      printChildren(node);
    })
  } else {
    localBookmarks.push(
      {
        title: tree.title, 
        url: tree.url,
        uid: getHash(`${tree.title}-${tree.url}`)
      }
    )
  }
}

const printChildren = (node) => {
  if (node.children) {
    printChildren(node.children);
  } else {
    flattenTree(node);
  }
}

const addBookmark = (bookmark) => {
  if (!bookmark.title) return

  let p = new Paragraph((bookmark.title.length > 30 ? bookmark.title.substr(0, 30) + '...' 
      : bookmark.title + new Array(34 - bookmark.title.length).join("&nbsp;")) + ' | ', {
    className: 'bookmark-entry'
  })

  let a = new Anchor('x', { title: bookmark.title, target: '_blank', href: bookmark.url })

  p.appendChild(a.getElement());

  p.appendChild(new Span(' | ').getElement());

  if (bookmark.remote){
    p.appendChild(new Span('Remote').getElement());
  } else {
    if (bookmark.stored){
      let a = new Anchor('Synced', {
        id: `bkpr_${bookmark.uid}`, 
        href: "#remove-remote",
        onclick: (e) => deleteRemoteBookmark(e)
      }).getElement();
      p.appendChild(a);
      p.appendChild(new Span(' | ').getElement());
    } else {
      let a = new Anchor('Upload', {
        id: `bkpr_${bookmark.uid}`, 
        href: "#upload-bookmark",
        onclick: (e) => uploadBookmark(e)
      }).getElement();
      p.appendChild(a);
      p.appendChild(new Span(' | ').getElement());
    }
  }
  list.appendChild(p.getElement());
}

const uploadBookmark = (event) => {
  const bookmarkId = event.target.id.substr(5, event.target.id.length);
  console.log(bookmarkId);
  let bookmark = mergedBookmarks.find(x => x.uid == bookmarkId);
  fetch(`${bookkeeperServer}/api/bookmark`, {
    method: 'PUT',
    body: JSON.stringify(bookmark), 
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(res => {
    res.json()
    event.target.innerHTML = 'Synced';
    event.target.href = '#remove-remote';
    event.target.onclick = (e) => deleteRemoteBookmark(e);
  })
  .catch(error => console.error('Error:', error))
  return false
}

const deleteRemoteBookmark = (event) => {
  const bookmarkId = event.target.id.substr(5, event.target.id.length);
  let bookmark = mergedBookmarks.find(x => x.uid == bookmarkId);
  fetch(`${bookkeeperServer}/api/bookmark`, {
    method: 'DELETE',
    body: JSON.stringify(bookmark), 
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  }).then(res => {
    res.json()
    event.target.innerHTML = 'Upload';
    event.target.href = '#upload-bookmark';
    event.target.onclick = (e) => uploadBookmark(e);
  })
  .catch(error => console.error('Error:', error))
  return false
}

const addButton = () => {
  var button = document.createElement("button");
  var linkText = document.createTextNode("Copy to Clipboard");
  button.appendChild(linkText);
  button.onclick = () => {
    copyToClipboard(mergedBookmarks.toString());
  }
  list.appendChild(button)
}

const getLocalBookmarks = () => {
  return new Promise( resolve => {
    chrome.bookmarks.getTree( (tree) => {
      flattenTree(tree);
      resolve()
    })
  })
}

const mergeBookmarks = () => {
  localBookmarks.forEach( localBookmark => {
    let idx = remoteBookmarks.findIndex( x => x.title === localBookmark.title)
    if ( idx > -1) {
      localBookmark.stored = true;
      remoteBookmarks.splice(idx, 1);
    }
    mergedBookmarks.push(localBookmark)
  })
  remoteBookmarks.forEach (remoteBookmark => {
    remoteBookmark.remote = true;
    remoteBookmark.stored = true;
    mergedBookmarks.push(remoteBookmark);
  })
}

const printBookmarks = () => {
  mergedBookmarks.forEach( bookmark => {
    addBookmark(bookmark);
  })
}

const init = async ( ) => {
  await Promise.all([getRemoteBookmarks(), getLocalBookmarks()]);
  mergeBookmarks();
  printBookmarks();
  addButton();
}

init();

document.addEventListener('DOMContentLoaded', () => {
  list = document.getElementById('bookmarks');
});
