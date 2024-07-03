export interface Repository<T> { 
  findAll(): T[] | undefined
  findOne(item: {id: number}): T | undefined
  add(item: T): T | undefined
  update(item: T): T | undefined
  remove(item: {id: number}): T | undefined
}
