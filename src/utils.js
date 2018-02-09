class Span {
  constructor (text, options = {}){
    const {className} = options;
    this._element = document.createElement('span');
    this._element.innerHTML = text;
    if (className) this._element.classList.add(className)
  }

  appendChild (element) {
    this._element.appendChild(element);
  }

  getElement () {
    return this._element;
  }
}

class Paragraph {
  constructor (text, options = {}){
    const {className} = options;
    this._element = document.createElement('p');
    this._element.innerHTML = text;
    if (className) this._element.classList.add(className)
  }

  appendChild (element) {
    this._element.appendChild(element);
  }

  getElement () {
    return this._element;
  }
}

class Anchor {
  constructor (text, options = {}){
    const {title, target, href, className, onclick, id} = options;
    this._element = document.createElement('a');
    this._element.innerHTML = text;
    this._element.title = title || 'Click Me';
    this._element.id = id;
    this._element.target = target || '_blank';
    this._element.href = href || '#';
    this._element.onclick = onclick
    if (className) this._element.classList.add(className)
  }

  appendChild (element) {
    this._element.appendChild(element);
  }

  getElement () {
    return this._element;
  }
}

export {
  Paragraph,
  Anchor,
  Span
}
