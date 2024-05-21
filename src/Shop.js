export class Shop {
  // Al declararla como `static` pasa a ser una variable de Clase (como en Java)
  static #ID_COUNTER = 0;
  #id;
  #name;
  #img;
  #home;

  constructor(name, img, link) {
    this.#id = ++Shop.#ID_COUNTER;
    this.#name = name;
    this.#img = img;
    this.#home = link;
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }
  set name(n) {
    this.#name = n;
  }

  get img() {
    return this.#img;
  }
  set img(i) {
    this.#img = i;
  }

  get home() {
    return this.#home;
  }
  set home(h) {
    this.#home = h;
  }
}
