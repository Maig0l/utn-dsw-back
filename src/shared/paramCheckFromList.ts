import { Request } from "express";

// TODO: Volar esto a la mierda. Fue una mala idea (ver user.repository.ts)

/** DEPRECADO: NO USAR!! USAR MEJOR ESQUEMAS DE Valibot
 *
 * Toma los parámetros válidos (admitidos para post/put/patch) y genera una
 * función que chequea si el objeto (por ejemplo, request.body)tiene los
 * atributos necesarios
 *
 * @param {Request} data - La request enviada desde el controller
 * @param {boolean} all - Chequear que tenga *todos* los atributos, o sólo
 * algunos¿ (usar `false` para el patch)
 */
export function paramCheckFromList(attrs: string[]) {
  return (obj: any, all: boolean) => {
    const ATTRS = attrs;

    let f = (e: string) => {
      return Object.keys(obj).includes(e);
    };
    if (all) return ATTRS.every(f);
    else return ATTRS.some(f);
  };
}
