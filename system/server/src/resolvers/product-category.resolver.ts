import { EDBEntity, GraphQLPaths, TAuthRole, TPagedList, TProduct, TProductCategory } from '@cromwell/core';
import {
    CreateProductCategory,
    DeleteManyInput,
    entityMetaRepository,
    PagedParamsInput,
    PagedProduct,
    PagedProductCategory,
    ProductCategory,
    ProductCategoryFilterInput,
    ProductCategoryRepository,
    ProductRepository,
    UpdateProductCategory,
} from '@cromwell/core-backend';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Arg, Authorized, FieldResolver, Int, Mutation, Query, Resolver, Root } from 'type-graphql';
import { getCustomRepository } from 'typeorm';

import { resetAllPagesCache } from '../helpers/reset-page';
import { serverFireAction } from '../helpers/server-fire-action';

const getOneBySlugPath = GraphQLPaths.ProductCategory.getOneBySlug;
const getOneByIdPath = GraphQLPaths.ProductCategory.getOneById;
const getManyPath = GraphQLPaths.ProductCategory.getMany;
const createPath = GraphQLPaths.ProductCategory.create;
const updatePath = GraphQLPaths.ProductCategory.update;
const deletePath = GraphQLPaths.ProductCategory.delete;
const deleteManyPath = GraphQLPaths.ProductCategory.deleteMany;
const deleteManyFilteredPath = GraphQLPaths.ProductCategory.deleteManyFiltered;
const getRootCategoriesPath = GraphQLPaths.ProductCategory.getRootCategories;
const getFilteredPath = GraphQLPaths.ProductCategory.getFiltered;
const productsKey: keyof TProductCategory = 'products';
const parentKey: keyof TProductCategory = 'parent';
const childrenKey: keyof TProductCategory = 'children';
const viewsKey: keyof TProductCategory = 'views';
const nestedLevelKey: keyof TProductCategory = 'nestedLevel';

@Resolver(ProductCategory)
export class ProductCategoryResolver {

    private repository = getCustomRepository(ProductCategoryRepository)
    private productRepository = getCustomRepository(ProductRepository)

    @Query(() => PagedProductCategory)
    async [getManyPath](@Arg("pagedParams") pagedParams: PagedParamsInput<TProductCategory>): Promise<TPagedList<TProductCategory>> {
        return await this.repository.getProductCategories(pagedParams);
    }

    @Query(() => ProductCategory)
    async [getOneBySlugPath](@Arg("slug") slug: string) {
        return await this.repository.getProductCategoryBySlug(slug);
    }

    @Query(() => ProductCategory)
    async [getOneByIdPath](@Arg("id", () => Int) id: number) {
        return await this.repository.getProductCategoryById(id);
    }

    @Authorized<TAuthRole>("administrator")
    @Mutation(() => ProductCategory)
    async [createPath](@Arg("data") data: CreateProductCategory) {
        const category = await this.repository.createProductCategory(data);
        serverFireAction('create_product_category', category);
        resetAllPagesCache();
        return category;
    }

    @Authorized<TAuthRole>("administrator")
    @Mutation(() => ProductCategory)
    async [updatePath](@Arg("id", () => Int) id: number, @Arg("data") data: UpdateProductCategory) {
        const category = await this.repository.updateProductCategory(id, data);
        serverFireAction('update_product_category', category);
        resetAllPagesCache();
        return category;
    }

    @Authorized<TAuthRole>("administrator")
    @Mutation(() => Boolean)
    async [deletePath](@Arg("id", () => Int) id: number) {
        const category = await this.repository.deleteProductCategory(id);
        serverFireAction('delete_product_category', { id });
        resetAllPagesCache();
        return category;
    }

    @Authorized<TAuthRole>("administrator")
    @Mutation(() => Boolean)
    async [deleteManyPath](@Arg("data") data: DeleteManyInput): Promise<boolean | undefined> {
        return this.repository.deleteManyCategories(data);
    }

    @Authorized<TAuthRole>("administrator")
    @Mutation(() => Boolean)
    async [deleteManyFilteredPath](
        @Arg("input") input: DeleteManyInput,
        @Arg("filterParams", { nullable: true }) filterParams?: ProductCategoryFilterInput,
    ): Promise<boolean | undefined> {
        const res = await this.repository.deleteManyCategories(input, filterParams);
        resetAllPagesCache();
        return res;
    }

    @Query(() => PagedProductCategory)
    async [getRootCategoriesPath](): Promise<TPagedList<ProductCategory>> {
        return this.repository.getRootCategories();
    }

    @Query(() => PagedProductCategory)
    async [getFilteredPath](
        @Arg("pagedParams", { nullable: true }) pagedParams?: PagedParamsInput<TProductCategory>,
        @Arg("filterParams", { nullable: true }) filterParams?: ProductCategoryFilterInput,
    ): Promise<TPagedList<TProductCategory>> {
        return this.repository.getFilteredCategories(pagedParams, filterParams);
    }

    @FieldResolver(() => PagedProduct)
    async [productsKey](@Root() productCategory: ProductCategory, @Arg("pagedParams") pagedParams: PagedParamsInput<TProduct>): Promise<TPagedList<TProduct>> {
        return await this.productRepository.getProductsFromCategory(productCategory.id, pagedParams);
    }

    @FieldResolver(() => ProductCategory, { nullable: true })
    async [parentKey](@Root() productCategory: ProductCategory): Promise<TProductCategory | undefined | null> {
        return await this.repository.getParentCategory(productCategory);
    }

    @FieldResolver(() => [ProductCategory])
    async [childrenKey](@Root() productCategory: ProductCategory): Promise<TProductCategory[]> {
        return await this.repository.getChildCategories(productCategory);
    }

    @FieldResolver(() => GraphQLJSONObject, { nullable: true })
    async customMeta(@Root() entity: ProductCategory, @Arg("keys", () => [String]) fields: string[]): Promise<any> {
        return entityMetaRepository.getEntityMetaByKeys(EDBEntity.ProductCategory, entity.id, fields);
    }

    @FieldResolver(() => Int, { nullable: true })
    async [viewsKey](@Root() entity: ProductCategory): Promise<number | undefined> {
        return this.repository.getEntityViews(entity.id, EDBEntity.ProductCategory);
    }

    @FieldResolver(() => Int, { nullable: true })
    async [nestedLevelKey](@Root() entity: ProductCategory): Promise<number> {
        return this.repository.getNestedLevel(entity);
    }
}