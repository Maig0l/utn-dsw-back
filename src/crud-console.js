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

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import menuImport from './menu.js';
const menu = menuImport.menu;
const clear = menuImport.clear;
import { Shop } from './Shop.js';

const rl = readline.createInterface({ input, output });

/* APP */
const tiendas = [];

// Crear menú
const menuPpal = {
  1: { display: 'Crear tienda', cb: createShop },
  2: { display: 'Listar tiendas', cb: listShops },
  3: { display: 'Editar tienda', cb: modifyShop },
  4: { display: 'Eliminar tienda', cb: deleteShop },
};
await menu('Administración tiendas', menuPpal, rl);

rl.close();

/* Funciones del CRUD */
async function createShop() {
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

/**
 *
 * @param {*} options
 * `options` es un objeto con dos posibles booleanos, y el parámetro es opcional
 * - Si block es true, la función espera al usuario para salir
 * - Si compact es true, sólo lista los id y nombres
 */
async function listShops(options = { block: true }) {
  clear();
  console.log('## Tiendas (id: nombre)');
  tiendas.forEach((t) => {
    let item = `* ${t.id}: "${t.name}"`;
    if (!options.compact) {
      item += `\n  - Homepage: ${t.home}`;
      item += `\n  - Ícono: ${t.img}`;
    }

    console.log(item);
  });
  if (options.block) await rl.question('\n<Enter> para volver');
}

async function deleteShop() {
  let repeat;
  do {
    clear();
    listShops({ block: false, compact: true });
    console.log('\nIngrese ID de la tienda a eliminar (0 para volver)');
    let sel = Number.parseInt(await rl.question('> '));

    if (sel == 0) return;

    const idx = tiendas.findIndex((el) => el.id === sel);
    tiendas.splice(idx, 1);

    let repeat = (
      await rl.question('* Tienda borrada. ¿Borrar otra?\n[y/N]> ')
    ).toLowerCase();
  } while (repeat === 'y');
}

async function modifyShop() {
  let repeat;
  do {
    clear();
    listShops({ block: false, compact: true });
    console.log('Ingrese ID de la tienda a modificar (0 para salir)');
    let sel = Number.parseInt(await rl.question('> '));
    const idx = tiendas.findIndex((el) => el.id === sel);

    // Guard statement
    if (sel == 0) return;

    console.log('Escriba el nuevo nombre (vacio para mantener)');
    let name = await rl.question('> ');
    if (name !== '') {
      tiendas[idx].name = name;
    }

    console.log('Escriba el nuevo path al ícono (vacio para mantener)');
    let img = await rl.question('> ');
    if (img !== '') {
      tiendas[idx].img = img;
    }

    console.log('Escriba la nueva dirección web (vacío para mantener)');
    let link = await rl.question('> ');
    if (link !== '') {
      tiendas[idx].home = link;
    }

    repeat = (
      await rl.question('* Tienda modificada. ¿Cambiar otra?\n[y/N]> ')
    ).toLowerCase();
  } while (repeat === 'y');
}
