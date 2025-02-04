import { Entity, Property, ManyToMany, OneToMany, Cascade, Collection } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Game } from '../game/game.entity.js';

@Entity()
export class Franchise extends BaseEntity {
  @Property({ nullable: false, unique: true })
  name!: string;

  @OneToMany(() => Game, (game) => game.franchise, {
    cascade: [Cascade.ALL],
  })
  games = new Collection<Game>(this);
}
