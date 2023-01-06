import loadingSVGUrl from '../assets/loading.svg';

class Loading extends HTMLImageElement {
  constructor() {
    super();
    this.height = 50;
    this.width = 50;
    this.src = loadingSVGUrl;
    this.style.position = 'absolute';
    this.style.top = '50%';
    this.style.left = '50%';
    this.style.transform = 'translate(-50%, -50%)';
  }
}

customElements.define('loading-img', Loading, { extends: 'img' });
