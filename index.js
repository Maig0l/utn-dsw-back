/** SCOPE ACTUAL: CRUD de Tienda
 * - Crear tienda
 * - Leer tienda
 * - Actualizar tienda
 * - Eliminar tienda
 *
 * Atributos:
 * - idTienda
 * - nombre
 * - imgIcono (path)
 * - homepage (url)
 */

import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
import { Shop } from './Shop.js';
import menuImport from './menu.js';
const menu = menuImport.menu;
const clear = menuImport.clear;

const rl = readline.createInterface({ input, output });

/* APP */
const tiendas = [];

const menuPpal = {
  1: { display: 'Crear tienda', cb: createShop },
  2: { display: 'Listar tiendas', cb: listShops },
  3: { display: 'Editar tienda', cb: notImplemented }, //editShop },
  4: { display: 'Eliminar tienda', cb: deleteShop },
};
await menu('Administración tiendas', menuPpal, rl);

rl.close();

/* Funciones del CRUD */
async function createShop() {
  // id, nombre, imagen, link
  // TODO: Para el id quería hacer un hash del `nombre+home` y al final quedó pendiente
  do {
    clear();
    const nombre = await rl.question('Nombre de la tienda \n> ');
    const img = await rl.question('Path al ícono \n> ');
    const home = await rl.question('Enlace al sitio web \n> ');

    const newShop = new Shop(nombre, img, home);
    tiendas.push(newShop);
    console.log('* Tienda añadida. ¿Crear otra?');
  } while ('y' === (await rl.question('[y/N]> ', (d) => d.toLowerCase())));
}

async function listShops() {
  clear();
  // TODO: Hacer un listado un poco más bonito
  console.log(tiendas);
  await rl.question('\n<Enter> para volver');
}

async function deleteShop() {
  do {
    clear();
    for (const s of tiendas) {
      console.log(`- ${s.name}: ID NOT_IMPLEMENTED`);
    }
    console.log('Escriba el nombre de la tienda a eliminar (vacío para salir)');
    let sel = await rl.question('> ');
    const idx = tiendas.findIndex(
      (el) => el.name.toLowerCase() === sel.toLowerCase()
    );

    tiendas.splice(idx, 1);
    console.log('* Tienda borrada. ¿Borrar otra?');
  } while ('y' === (await rl.question('[y/N]> ', (d) => d.toLowerCase())));
}

function notImplemented() {
  console.log('/!\\ No implementado');
}
