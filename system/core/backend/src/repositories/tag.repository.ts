import { TDeleteManyInput, TPagedList, TPagedParams, TTag, TTagInput } from '@cromwell/core';
import { EntityRepository, SelectQueryBuilder } from 'typeorm';

import { checkEntitySlug, getPaged, handleBaseInput, handleCustomMetaInput } from '../helpers/base-queries';
import { getLogger } from '../helpers/logger';
import { Tag } from '../models/entities/tag.entity';
import { BaseFilterInput } from '../models/filters/base-filter.filter';
import { PagedParamsInput } from '../models/inputs/paged-params.input';
import { BaseRepository } from './base.repository';

const logger = getLogger();

@EntityRepository(Tag)
export class TagRepository extends BaseRepository<Tag> {

    constructor() {
        super(Tag);
    }

    async getTags(params?: TPagedParams<TTag>): Promise<TPagedList<Tag>> {
        logger.log('TagRepository::getTags');
        return this.getPaged(params)
    }

    async getTagById(id: number): Promise<Tag | undefined> {
        logger.log('TagRepository::getTagById id: ' + id);
        return this.getById(id);
    }

    async getTagsByIds(ids: number[]): Promise<Tag[]> {
        logger.log('TagRepository::getTagsByIds ids: ' + ids.join(', '));
        return this.findByIds(ids);
    }

    async getTagBySlug(slug: string): Promise<Tag | undefined> {
        logger.log('TagRepository::getTagBySlug slug: ' + slug);
        return this.getBySlug(slug);
    }

    private async handleBaseTagInput(tag: Tag, input: TTagInput, action: 'update' | 'create') {
        await handleBaseInput(tag, input);

        tag.name = input.name;
        tag.color = input.color;
        tag.image = input.image;
        tag.description = input.description;
        tag.descriptionDelta = input.descriptionDelta;

        if (action === 'create') await tag.save();
        await checkEntitySlug(tag, Tag);
        await handleCustomMetaInput(tag, input);
    }

    async createTag(inputData: TTagInput, id?: number | null): Promise<Tag> {
        logger.log('TagRepository::createTag');
        const tag = new Tag();
        if (id) tag.id = id;

        await this.handleBaseTagInput(tag, inputData, 'create');
        await this.save(tag);
        return tag;
    }

    async updateTag(id: number, inputData: TTagInput): Promise<Tag> {
        logger.log('TagRepository::updateTag id: ' + id);
        const tag = await this.getById(id);

        await this.handleBaseTagInput(tag, inputData, 'update');
        await this.save(tag);
        return tag;
    }

    async deleteTag(id: number): Promise<boolean> {
        logger.log('TagRepository::deleteTag; id: ' + id);

        const tag = await this.getTagById(id);
        if (!tag) {
            logger.error('TagRepository::deleteTag failed to find Tag by id');
            return false;
        }
        const res = await this.delete(id);
        return true;
    }

    applyTagFilter(qb: SelectQueryBuilder<Tag>, filterParams?: BaseFilterInput) {
        this.applyBaseFilter(qb, filterParams)
        return qb;
    }

    async getFilteredTags(pagedParams?: PagedParamsInput<Tag>, filterParams?: BaseFilterInput): Promise<TPagedList<Tag>> {
        const qb = this.createQueryBuilder(this.metadata.tablePath);
        qb.select();
        this.applyTagFilter(qb, filterParams);
        return await getPaged<Tag>(qb, this.metadata.tablePath, pagedParams);
    }

    async deleteManyFilteredTags(input: TDeleteManyInput, filterParams?: BaseFilterInput): Promise<boolean | undefined> {
        const qbSelect = this.createQueryBuilder(this.metadata.tablePath).select([`${this.metadata.tablePath}.id`]);
        this.applyTagFilter(qbSelect, filterParams);
        this.applyDeleteMany(qbSelect, input);

        const qbDelete = this.createQueryBuilder(this.metadata.tablePath).delete()
            .where(`${this.metadata.tablePath}.id IN (${qbSelect.getQuery()})`)
            .setParameters(qbSelect.getParameters());

        await qbDelete.execute();
        return true;
    }
}
