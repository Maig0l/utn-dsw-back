export interface Repository<Tipo> { 
  findAll(): Tipo[] | undefined
  findOne(item: {id: number}): Tipo | undefined
  add(item: Tipo): Tipo | undefined
  update(item: Tipo): Tipo | undefined
  remove(item: {id: number}): Tipo | undefined
}