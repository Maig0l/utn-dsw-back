export interface Repository<Type> {
    findAll(): Type[] | undefined
    findById(item: {id: number}): Type | undefined
    add(item: Type): Type | undefined
    update(item: Type): Type | undefined
    remove(item: Type): Type | undefined
}