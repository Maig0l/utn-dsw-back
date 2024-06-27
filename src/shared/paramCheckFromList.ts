import {Request} from 'express'

/** Toma los parámetros válidos (admitidos para post/put/patch) y genera una
 * función que chequea si el body de la request tiene los atributos necesarios
 * 
 * @param {Request} data - La request enviada desde el controller
 * @param {boolean} all - Chequear que tenga *todos* los atributos, o sólo
 * algunos¿ (usar `false` para el patch)
 */
export function paramCheckFromList(attrs: string[]) {
  return (req: Request, all: boolean) => {
    const ATTRS = attrs

    let f = (e: string) => {return Object.keys(req.body).includes(e)}
    if (all)
      return ATTRS.every(f)
    else
      return ATTRS.some(f)
  }
}