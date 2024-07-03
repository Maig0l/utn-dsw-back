import { User } from "./user.entity.js";
import { Repository } from "../shared/repository.js";
import { paramCheckFromList } from "../shared/paramCheckFromList.js";

const REQ_PARAMS = "nick email password".split(' ')
const VALID_PARAMS = "nick email password profilePic bio".split(' ')
const hasParams = paramCheckFromList(VALID_PARAMS)

const users: User[] = [];
users.push(new User("Maigol", "maigol@example.org", "hunter2"))

export class UserRepository implements Repository<User> {
  findAll(): User[] | undefined {
    return users;
  }

  findOne(item: { id: number }): User | undefined {
    const user = users.find((u) => u.id === item.id)
    if (!user)
      return
    return user
  }

  add(item: User): User | undefined {
    if (!paramCheckFromList(REQ_PARAMS)(item, true))
      return

    const user = new User(item.nick, item.email, item.password)
    users.push(user)
    return user
  }

  update(item: User): User | undefined {
    if (!hasParams(item, false))
      return

    const idx = users.findIndex((u) => u.nick === item.nick)
    if (idx == -1) 
      return

    users[idx] = {...users[idx], ...item}
    return users[idx]
  }

  remove(item: { id: number }): User | undefined {
    const idx = users.findIndex((u)=>{return u.id === item.id});
    if (idx == -1)
      return

    const user = users.splice(idx, 1)[0]
    return user
  }
}