'use strict'
const { knex } = require('../config/bookshelf');

class BaseRepository {

    constructor(model) {
        
        if (model) {
            this.Model      = model.Model;
            this.Schema     = model.Schema;
            this.Relations  = model.Relations;
            this.Primarykey = model.Primarykey;
        }

        this.index      = this.index.bind(this);
        this.show       = this.show.bind(this);
        this.create     = this.create.bind(this);
        this.update     = this.update.bind(this);
        this.delete     = this.delete.bind(this);
        this.deleteAll  = this.deleteAll.bind(this);

        this.getOptions      = this.getOptions.bind(this);
        this.makeObjetToSave = this.makeObjetToSave.bind(this);
    }

    async index(query) {
        try {
            const options = this.getOptions(query); 
            const model = new this.Model();
            options.where.forEach(function(w){
                model.where(knex.raw(w));
            });
            if (options.orderBy) {
                model.orderBy(options.orderBy, options.order);
            }
    
            const part1 = await model.fetchAll(options.fetchOptions);
            if (options.noPaginate) {
                return part1.toJSON();
            }
    
            let part2 = await model.fetchAll({columns: knex.raw('count(*) as count')});
            part2 = part2.toJSON();
            const pagination = {
                page: +options.fetchOptions.page,
                pageSize: +options.fetchOptions.pageSize,
                rowCount: part2[0].count || 0,
                pageCount: Math.floor((part2.length || 1) / options.fetchOptions.pageSize) + (part2.length % options.fetchOptions.pageSize > 0 ? 1 : 0)
            };
            return {
                models: part1,
                pagination
            };
        } catch (err) {
            throw(this.handleError(err));
        }  
    }

    async show(indentify, query = null) {
        try {
            const options = this.getOptions(query); 
            const model = new this.Model(indentify);
            const result = await model.fetch(options.fetchOptions);
            return result ? result.toJSON() : null;
        } catch (error) {
            throw(this.handleError(error));
        }
    }

    async create(data) {
        try {
            const objToSave = this.makeObjetToSave(data);
            const model = new this.Model(objToSave);
            const result = await model.save();
            return result.toJSON();
        } catch (error) {
            throw(this.handleError(error));
        }
    }

    async update(indentify, data) {
        try {
            const objToSave = this.makeObjetToSave(data);
            const model = new this.Model(indentify);
            const result = await model.save(objToSave, {patch: true});
            return result.toJSON();
        } catch (error) {
            throw(this.handleError(error));
        }
    }

    async delete(indentify) {
        try {
            const model = new this.Model(indentify);
            const result = await model.destroy()
            return result.toJSON();
        } catch (error) {
            throw(this.handleError(error));
        }
    }

    async deleteAll(where) {
        try {
            const model = new this.Model(indentify);
            where.forEach(function(w){
                model.where(knex.raw(w));
            });
            const result = await model.destroy()
            return result.toJSON();
        } catch (error) {
            throw(this.handleError(error));
        }
    }

    getOptions(query) {
        let order = 'ASC';
        let orderBy = null;
        let noPaginate = null;
        let fetchOptions = null;
        let relateds = [];
        let where = [];
    
        if (!query) {
            query = {
                page: 1,
                pageSize: 10,
                withRelateds: null,
                noPaginate: null,
                orderBy: null,
                order: null,
                where: null,
                relateds: null,
                columns: null,
            }
        }
    
        fetchOptions = {
            page: query.page || 1,
            pageSize: query.pageSize || 10,
        };
    
        if (query.noPaginate != undefined) {
            delete fetchOptions.page;
            delete fetchOptions.pageSize;
            noPaginate = true;
        }
        
        if (query.orderBy != undefined) {
            order = query.order || 'ASC';
            orderBy = query.orderBy || this.Primarykey;
        }
    
        if (query.where) {
            where = query.where.split(';');
        }
    
        if (query.columns) {
            fetchOptions.columns = query.columns
                .split(';')
                .filter(el => this.Schema.find(x => x.toLowerCase() == el.toLowerCase()));
        }
    
        if (query.relateds) {
            relateds = query.relateds
                .split(';')
                .filter(el => {
                    const r = el.split('.')[0];
                    this.Relations.find(x => x.toLowerCase() == r.toLowerCase());
                }); 
        }
    
        return {
            fetchOptions,
            order,
            orderBy,
            noPaginate,
            where,
            relateds
    
        };
    }

    async queryRaw(query, params = {}) {
        try {
            const result = await knex.raw(query, params); 
            return result[0];
        } catch (error) {
            throw(this.handleError(error));
        }
    }

    makePaginateRaw(registers, pagination = {page: 1, pageSize: 10}) {
        var rowCount = registers.length;
        var registersStard = (pagination.page - 1) * pagination.pageSize;
        var registersToSend = registers.splice(registersStard, pagination.pageSize);
        return {
            models: registersToSend,
            pagination: {
                page: +pagination.page,
                pageSize: +pagination.pageSize,
                rowCount: rowCount,
                pageCount: Math.ceil(rowCount / pagination.pageSize)
            }
        };
    }

    handleError(err) {
        return {
            code: err.code,
            errno: err.errno,
            message: err.message || err.sqlMessage || null
        };
    }

    makeObjetToSave(data){
        let obj = {};
        this.Schema.forEach((column) => {
            if (data[column]) obj[column] = data[column];
        })
        return obj;
    }
}

module.exports = BaseRepository;
