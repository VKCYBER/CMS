import { EDBEntity, GraphQLPaths, TAuthRole, TPagedList, TTag } from '@cromwell/core';
import {
    BaseFilterInput,
    DeleteManyInput,
    entityMetaRepository,
    InputTag,
    PagedParamsInput,
    PagedTag,
    Tag,
    TagRepository,
} from '@cromwell/core-backend';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Arg, Authorized, FieldResolver, Int, Mutation, Query, Resolver, Root } from 'type-graphql';
import { getCustomRepository } from 'typeorm';

import { resetAllPagesCache } from '../helpers/reset-page';
import { serverFireAction } from '../helpers/server-fire-action';

const getOneBySlugPath = GraphQLPaths.Tag.getOneBySlug;
const getOneByIdPath = GraphQLPaths.Tag.getOneById;
const getManyPath = GraphQLPaths.Tag.getMany;
const getFilteredPath = GraphQLPaths.Tag.getFiltered;
const createPath = GraphQLPaths.Tag.create;
const updatePath = GraphQLPaths.Tag.update;
const deletePath = GraphQLPaths.Tag.delete;
const deleteManyPath = GraphQLPaths.Tag.deleteMany;
const deleteManyFilteredPath = GraphQLPaths.Tag.deleteManyFiltered;
const viewsKey: keyof TTag = 'views';

@Resolver(Tag)
export class TagResolver {

    private repository = getCustomRepository(TagRepository);

    @Query(() => PagedTag)
    async [getManyPath](@Arg("pagedParams", { nullable: true }) pagedParams?: PagedParamsInput<TTag>):
        Promise<TPagedList<TTag>> {
        return this.repository.getTags(pagedParams);
    }

    @Query(() => Tag)
    async [getOneBySlugPath](@Arg("slug") slug: string): Promise<TTag | undefined> {
        return this.repository.getTagBySlug(slug);
    }

    @Query(() => Tag)
    async [getOneByIdPath](@Arg("id", () => Int) id: number): Promise<TTag | undefined> {
        entityMetaRepository.getAllEntityMetaKeys(EDBEntity.CustomEntity);
        return this.repository.getTagById(id);
    }

    @Authorized<TAuthRole>("administrator", 'author')
    @Mutation(() => Tag)
    async [createPath](@Arg("data") data: InputTag): Promise<TTag> {
        const tag = await this.repository.createTag(data);
        serverFireAction('create_tag', tag);
        resetAllPagesCache();
        return tag;
    }

    @Authorized<TAuthRole>("administrator", 'author')
    @Mutation(() => Tag)
    async [updatePath](@Arg("id", () => Int) id: number, @Arg("data") data: InputTag): Promise<TTag | undefined> {
        const tag = await this.repository.updateTag(id, data);
        serverFireAction('update_tag', tag);
        resetAllPagesCache();
        return tag;
    }

    @Authorized<TAuthRole>("administrator", 'author')
    @Mutation(() => Boolean)
    async [deletePath](@Arg("id", () => Int) id: number): Promise<boolean> {
        const tag = await this.repository.deleteTag(id);
        serverFireAction('delete_tag', { id });
        resetAllPagesCache();
        return tag;
    }

    @Authorized<TAuthRole>("administrator", 'author')
    @Mutation(() => Boolean)
    async [deleteManyPath](@Arg("data") data: DeleteManyInput): Promise<boolean | undefined> {
        const res = await this.repository.deleteMany(data);
        resetAllPagesCache();
        return res;
    }

    @Authorized<TAuthRole>("administrator")
    @Mutation(() => Boolean)
    async [deleteManyFilteredPath](
        @Arg("input") input: DeleteManyInput,
        @Arg("filterParams", () => BaseFilterInput, { nullable: true }) filterParams?: BaseFilterInput,
    ): Promise<boolean | undefined> {
        const res = await this.repository.deleteManyFilteredTags(input, filterParams);
        resetAllPagesCache();
        return res;
    }

    @Query(() => PagedTag)
    async [getFilteredPath](
        @Arg("pagedParams", { nullable: true }) pagedParams?: PagedParamsInput<TTag>,
        @Arg("filterParams", () => BaseFilterInput, { nullable: true }) filterParams?: BaseFilterInput,
    ): Promise<TPagedList<TTag> | undefined> {
        return this.repository.getFilteredTags(pagedParams, filterParams);
    }

    @FieldResolver(() => GraphQLJSONObject, { nullable: true })
    async customMeta(@Root() entity: Tag, @Arg("keys", () => [String]) fields: string[]): Promise<any> {
        return entityMetaRepository.getEntityMetaByKeys(EDBEntity.Tag, entity.id, fields);
    }

    @FieldResolver(() => Int, { nullable: true })
    async [viewsKey](@Root() product: Tag): Promise<number | undefined> {
        return this.repository.getEntityViews(product.id, EDBEntity.Tag);
    }
}