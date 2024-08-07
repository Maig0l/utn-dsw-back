import { Repository } from "../shared/repository.js";
import { Tag } from "./tag.entity.js";

const tags: Tag[] = [];
tags.push(new Tag("Action","Juegos con mucha violencia"))

export class TagRepository implements Repository<Tag>{
    public findOne(item: { id: number }): Tag | undefined {
        return tags.find((tag) => tag.id == item.id)
    }

    public add(item: Tag): Tag | undefined {
        tags.push(item)
        return item
    }

    public update(item: Tag): Tag | undefined {
        const tagIdx = tags.findIndex((tag) => tag.id === item.id)

        if (tagIdx !== -1)
          tags[tagIdx] = {...tags[tagIdx], ...item, id: tags[tagIdx].id }

        return tags[tagIdx]
    }

    public remove(item: { id: number }): Tag | undefined {
        const tagIdx = tags.findIndex((tag) => String(tag.id) === String(item.id))

        if (tagIdx !== -1) {
          const deletedTags = tags[tagIdx]
          tags.splice(tagIdx, 1)
          return deletedTags
        }
    }

    public findAll(): Tag[] | undefined {
        return tags 
    }
}