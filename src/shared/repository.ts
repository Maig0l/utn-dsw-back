export interface Repository<T, idT> { 
  findAll(): T[] | undefined
  findOne(item: {id: idT}): T | undefined
  add(item: T): T | undefined
  update(item: T): T | undefined
  remove(item: {id: idT}): T | undefined
}
