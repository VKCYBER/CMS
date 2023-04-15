import {
    EDBEntity,
    getStoreItem,
    TBasePageEntity,
    TDeleteManyInput,
    TPagedList,
    TPagedParams,
    TProductCategory,
    TProductCategoryInput,
} from '@cromwell/core';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
    Brackets,
    ConnectionOptions,
    EntityRepository,
    getConnection,
    getCustomRepository,
    SelectQueryBuilder,
    TreeRepository,
} from 'typeorm';

import {
    applyBaseFilter,
    applyGetManyFromOne,
    applyGetPaged,
    checkEntitySlug,
    getPaged,
    getSqlBoolStr,
    getSqlLike,
    handleBaseInput,
    handleCustomMetaInput,
    wrapInQuotes,
} from '../helpers/base-queries';
import { entityMetaRepository } from '../helpers/entity-meta';
import { getLogger } from '../helpers/logger';
import { ProductCategory } from '../models/entities/product-category.entity';
import { BaseFilterInput } from '../models/filters/base-filter.filter';
import { ProductCategoryFilterInput } from '../models/filters/product-category.filter';
import { PagedParamsInput } from '../models/inputs/paged-params.input';
import { CreateProductCategory } from '../models/inputs/product-category.create';
import { UpdateProductCategory } from '../models/inputs/product-category.update';
import { ProductRepository } from './product.repository';

const logger = getLogger();

@EntityRepository(ProductCategory)
export class ProductCategoryRepository extends TreeRepository<ProductCategory> {

    public dbType: ConnectionOptions['type'];

    constructor() {
        super();
        this.dbType = getStoreItem('dbInfo')?.dbType as ConnectionOptions['type']
            ?? getConnection().options.type;
    }

    getSqlBoolStr = (b: boolean) => getSqlBoolStr(this.dbType, b);
    getSqlLike = () => getSqlLike(this.dbType);
    quote = (str: string) => wrapInQuotes(this.dbType, str);

    async getProductCategories(params: TPagedParams<TProductCategory>): Promise<TPagedList<TProductCategory>> {
        logger.log('ProductCategoryRepository::getProductCategories');
        const qb = this.createQueryBuilder(this.metadata.tablePath);

        return getPaged(qb, this.metadata.tablePath, params);
    }

    async getProductCategoriesById(ids: number[]): Promise<ProductCategory[]> {
        logger.log('ProductCategoryRepository::getProductCategoriesById ids: ' + ids.join(', '));
        return this.findByIds(ids);
    }

    async getProductCategoryById(id: number): Promise<ProductCategory> {
        logger.log('ProductCategoryRepository::getProductCategoryById id: ' + id);
        const category = await this.findOne({
            where: { id }
        });
        if (!category) throw new HttpException(`ProductCategory ${id} not found!`, HttpStatus.NOT_FOUND);
        return category;
    }

    async getProductCategoryBySlug(slug: string): Promise<ProductCategory> {
        logger.log('ProductCategoryRepository::getProductCategoryBySlug slug: ' + slug);
        const category = await this.findOne({
            where: { slug }
        });
        if (!category) throw new HttpException(`ProductCategory ${slug} not found!`, HttpStatus.NOT_FOUND);
        return category;
    }

    async handleProductCategoryInput(productCategory: ProductCategory, input: TProductCategoryInput, action: 'update' | 'create') {
        await handleBaseInput(productCategory, input);

        productCategory.name = input.name;
        productCategory.mainImage = input.mainImage;
        productCategory.description = input.description;
        productCategory.descriptionDelta = input.descriptionDelta;

        const newParent: ProductCategory | undefined | null | void | 0 = input.parentId &&
            await this.getProductCategoryById(input.parentId)
                .catch(() => null);

        if (newParent && newParent?.id) {
            productCategory.parent = newParent;
        }

        if (!newParent) {
            productCategory.parent = null;
        }
        if (action === 'create') await productCategory.save();
        await checkEntitySlug(productCategory, ProductCategory);
        await handleCustomMetaInput(productCategory, input);
    }

    async createProductCategory(createProductCategory: CreateProductCategory, id?: number | null): Promise<ProductCategory> {
        logger.log('ProductCategoryRepository::createProductCategory');
        const productCategory = new ProductCategory();
        if (id) productCategory.id = id;

        await this.handleProductCategoryInput(productCategory, createProductCategory, 'create');
        await this.save(productCategory);
        return productCategory;
    }

    async updateProductCategory(id: number, updateProductCategory: UpdateProductCategory): Promise<ProductCategory> {
        logger.log('ProductCategoryRepository::updateProductCategory id: ' + id);
        const productCategory = await this.getProductCategoryById(id);
        if (!productCategory) throw new HttpException(`ProductCategory ${id} not found!`, HttpStatus.NOT_FOUND);

        await this.handleProductCategoryInput(productCategory, updateProductCategory, 'create');
        await this.save(productCategory);
        return productCategory;
    }

    async deleteProductCategory(id: number): Promise<boolean> {
        logger.log('ProductCategoryRepository::deleteProductCategory id: ' + id);
        const productCategory = await this.getProductCategoryById(id);
        if (!productCategory) throw new HttpException(`ProductCategory ${id} not found!`, HttpStatus.NOT_FOUND);

        const children = await this.getChildCategories(productCategory);
        if (children?.length) {
            await Promise.all(children.map(async child => {
                child.parent = null;
                await this.save(child);
            }));
        }

        await this.remove(productCategory);
        return true;
    }

    async deleteManyCategories(input: TDeleteManyInput, filterParams?: ProductCategoryFilterInput) {
        const qb = this.createQueryBuilder(this.metadata.tablePath);
        qb.select(['id']);
        if (filterParams) this.applyCategoryFilter(qb, filterParams);

        if (input.all) {
            if (input.ids?.length) {
                qb.andWhere(`${this.metadata.tablePath}.id NOT IN (:...ids)`, { ids: input.ids ?? [] })
            } else {
                // no WHERE needed
            }
        } else {
            if (input.ids?.length) {
                qb.andWhere(`${this.metadata.tablePath}.id IN (:...ids)`, { ids: input.ids ?? [] })
            } else {
                throw new HttpException(`applyDeleteMany: You have to specify ids to delete for ${this.metadata.tablePath}`, HttpStatus.BAD_REQUEST);
            }
        }

        const categories = await qb.execute();
        for (const category of categories) {
            await this.deleteProductCategory(category?.id);
        }
        return true;
    }

    async getCategoriesOfProduct(productId: number, params?: TPagedParams<TProductCategory>): Promise<TProductCategory[]> {
        logger.log('ProductCategoryRepository::getCategoriesOfProduct id: ' + productId);
        const qb = this.createQueryBuilder(this.metadata.tablePath);
        applyGetManyFromOne(qb, this.metadata.tablePath, 'products',
            getCustomRepository(ProductRepository).metadata.tablePath, productId);

        applyGetPaged(qb, this.metadata.tablePath, params);
        return await qb.getMany();
    }

    async getChildCategories(category: ProductCategory): Promise<ProductCategory[]> {
        logger.log('ProductCategoryRepository::getChildCategories id: ' + category.id);
        return (await this.findDescendantsTree(category))?.children ?? [];
    }

    async getParentCategory(category: ProductCategory): Promise<ProductCategory | undefined | null> {
        logger.log('ProductCategoryRepository::getParentCategory id: ' + category.id);
        return (await this.findAncestorsTree(category))?.parent;
    }

    async getRootCategories(): Promise<TPagedList<ProductCategory>> {
        const parentColumn = this.metadata.treeParentRelation?.joinColumns[0].databaseName;
        const qb = this.createQueryBuilder(this.metadata.tablePath).select();
        if (parentColumn) {
            qb.where(`${this.metadata.tablePath}.${this.quote(parentColumn)} IS NULL`);
        }

        const [rootCategories, total] = await Promise.all([
            qb.getMany(),
            this.createQueryBuilder(this.metadata.tablePath).select().getCount(),
        ]);

        return {
            elements: rootCategories,
            pagedMeta: {
                totalElements: total,
            }
        }
    }

    applyBaseFilter(qb: SelectQueryBuilder<TBasePageEntity>, filter?: BaseFilterInput): SelectQueryBuilder<TBasePageEntity> {
        if (!filter) return qb;
        const entityType = entityMetaRepository.getEntityType(ProductCategory);
        if (!entityType) return qb;
        return applyBaseFilter({ qb, filter, entityType, dbType: this.dbType });
    }

    applyCategoryFilter(qb: SelectQueryBuilder<ProductCategory>, filterParams?: ProductCategoryFilterInput) {
        this.applyBaseFilter(qb, filterParams);

        // Search by category name or id
        if (filterParams?.nameSearch && filterParams.nameSearch !== '') {
            const likeStr = `%${filterParams.nameSearch}%`;

            const brackets = new Brackets(subQb => {
                subQb.where(`${this.metadata.tablePath}.name ${this.getSqlLike()} :likeStr`, { likeStr });

                if (!isNaN(parseInt(filterParams.nameSearch + '')))
                    subQb.orWhere(`${this.metadata.tablePath}.id = :idSearch`, {
                        idSearch: filterParams.nameSearch
                    });
            });
            qb.andWhere(brackets);
        }
    }

    async getFilteredCategories(pagedParams?: PagedParamsInput<ProductCategory>, filterParams?: ProductCategoryFilterInput):
        Promise<TPagedList<TProductCategory>> {
        const qb = this.createQueryBuilder(this.metadata.tablePath);
        qb.select();
        this.applyCategoryFilter(qb, filterParams);
        return await getPaged(qb, this.metadata.tablePath, pagedParams);
    }

    applyGetEntityViews(qb: SelectQueryBuilder<TBasePageEntity>, entityType: EDBEntity) {
        return getCustomRepository(ProductRepository).applyGetEntityViews.call(this, qb, entityType);
    }

    async getEntityViews(entityId: number, entityType: EDBEntity) {
        return getCustomRepository(ProductRepository).getEntityViews.call(this, entityId, entityType);
    }

    async getNestedLevel(category: ProductCategory) {
        return ((await this.countAncestors(category)) ?? 0);
    }
}