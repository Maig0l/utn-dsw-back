export class Shop {
  constructor(name, img, link) {
    this.name = name;
    this.img = img;
    this.home = link;
  }

  get name() {
    return this.name;
  }
  set name(n) {
    this.name = n;
  }

  get img() {
    return this.img;
  }
  set img(i) {
    this.img = i;
  }

  get home() {
    return this.home;
  }
  set home(h) {
    this.home = h;
  }
}
