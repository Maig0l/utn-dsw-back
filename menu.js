const EXIT_OPT = '0';

async function menu(title, options, linefeed) {
  const validOpts = Object.keys(options);
  const isValidOpt = (i) => validOpts.indexOf(i) !== -1;
  let opc;

  clear();
  do {
    console.log(`# ${title}`);
    //Uso for..of, NO for..in
    for (const k of validOpts) {
      console.log(`${k}. ${options[k].display}`);
    }
    console.log(`${EXIT_OPT}. Salir`);
    opc = await linefeed.question('> ');

    clear();
    if (opc !== EXIT_OPT && !isValidOpt(opc)) {
      console.log('/!\\ Opción inválida.\n');
    } else if (opc !== EXIT_OPT) {
      await options[opc].cb();
    }
  } while (opc != EXIT_OPT);
}

function clear() {
  console.log('\x1b[2J');
}

export default { menu, clear };

/*

Steam
/res/storeIcons/steam.svg
https://store.steampowered.com/

Epic Games
/res/storeIcons/epic.svg
https://store.epicgames.com

*/
