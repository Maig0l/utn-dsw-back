import { Repository } from "../shared/repository.js";
import { Shop } from "./shop.entity.js";

const shops: Shop[] = [];
shops.push(new Shop("Steam", "/assets/steam.svg", "https://steampowered.com/"))
shops.push(new Shop("Epic Games", "/assets/epic.svg", "https://store.epicgames.com/"))
shops.push(new Shop("PSN Store", "/assets/psn.svg", "https://store.playstation.com/"))

export class ShopRepository implements Repository<Shop> {
  public findAll(): Shop[] | undefined {
    return shops;
  }

  public findOne(item: { id: number; }): Shop | undefined {
    return shops.find((s)=>{return s.id === item.id});
  }

  public add(item: Shop): Shop | undefined {
    if (!reqHasParams(item, ["name", "img", "site"]))
      return

    const x = new Shop(item.name, item.img, item.site)
    shops.push(x);
    return x
  }

  // Un objeto que conforme al prototipo Shop debe tener los campos *públicos*
  //  name, site, img. Por eso, estos atributos en la clase deben ser públicos.
  public update(item: Shop): Shop | undefined {
    const idxShop = shops.findIndex((s) => s.id === item.id)
    if (idxShop === -1)
      return

    // El usuario no debe poder modificar el id
    shops[idxShop] = {...shops[idxShop], ...item, id: shops[idxShop].id}
    return shops[idxShop]
  }

  public remove(item: { id: number; }): Shop | undefined {
    const idxShop = shops.findIndex((e)=>{return e.id === item.id});
    if (idxShop == -1)
      return

    // splice elimina el elemento y devuelve un array de 1 item con la shop borrada
    const shop = shops.splice(idxShop, 1)[0]
    return shop
  }
}

function reqHasParams(item: Shop, params: string[]): Boolean {
  return params.every( (e) => {
    return Object.keys(item).includes(e)
  })
}

function reqHasSomeParams(item: Shop, params: string[]): Boolean {
  return params.some( (e) => {
    return Object.keys(item).includes(e)
  })
}