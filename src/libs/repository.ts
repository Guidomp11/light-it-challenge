import { Repository, FindOptionsWhere, FindOptionsOrder, FindOptionsRelations } from 'typeorm';

export abstract class BaseRepository<Entity extends { id: string | number }> {
  protected repository: Repository<Entity>;

  constructor(repository: Repository<Entity>) {
    this.repository = repository;
  }

  async findAll(
    relations?: FindOptionsRelations<Entity>,
    order?: FindOptionsOrder<Entity>
  ): Promise<Entity[]> {
    return this.repository.find({ relations, order });
  }

  async findById(
    id: string | number,
    relations?: FindOptionsRelations<Entity>
  ): Promise<Entity | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<Entity>,
      relations,
    });
  }

  async create(data: Partial<Entity>): Promise<Entity> {
    const entity = this.repository.create(data as Entity);
    return this.repository.save(entity);
  }

  async update(id: string | number, data: Partial<Entity>): Promise<Entity> {
    await this.repository.update(id, data as any);
    const updatedEntity = await this.findById(id);
    if (!updatedEntity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return updatedEntity;
  }

  async delete(id: string | number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}