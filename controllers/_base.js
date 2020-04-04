'use strict'
const { knex } = require('../config/bookshelf');

exports.index = async function({Model, Schema, Relations, Primarykey}, req) {
    const options = getOptions(Schema, Relations, Primarykey, req.query); 
    try {
        const model = new Model();
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

        let part2 = await model.fetchAll();
        part2 = part2.toJSON();
        const pagination = {
            page: +options.fetchOptions.page,
            pageSize: +options.fetchOptions.pageSize,
            rowCount: part2.length,
            pageCount: Math.floor((part2.length || 1) / options.fetchOptions.pageSize) + (part2.length % options.fetchOptions.pageSize > 0 ? 1 : 0)
        };
        return {
            models: part1,
            pagination
        };
    } catch (err) {
        throw(handleError(err));
    }  
};

exports.show = async function(Model, indentify) {
    try {
        const model = new Model(indentify);
        const result = await model.fetch();
        return result ? result.toJSON() : [];
    } catch (error) {
        throw(handleError(error));
    }
}

exports.create = async function(Model, data) {
    try {
        const model = new Model(data);
        const result = await model.save();
        return result.toJSON();
    } catch (error) {
        throw(handleError(error));
    }
};

exports.update = async function(Model, indentify, data) {
    try {
        const model = new Model(indentify);
        const result = await model.save(data, {patch: true});
        return result.toJSON();
    } catch (error) {
        throw(handleError(error));
    }
};

exports.delete = async function(Model, indentify) {
    try {
        const model = new Model(indentify);
        const result = await model.destroy()
        return result.toJSON();
    } catch (error) {
        throw(handleError(error));
    }
};

exports.deleteAll = async function(Model, where) {
    try {
        const model = new Model(indentify);
        where.forEach(function(w){
            model.where(knex.raw(w));
        });
        const result = await model.destroy()
        return result.toJSON();
    } catch (error) {
        throw(handleError(error));
    }
};

//funcoes usadas para filtrar dados
function getOptions(Schema, Relations, Primarykey, query) {
    let order = 'ASC';
    let orderBy = Primarykey;
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
        orderBy = query.orderBy || Primarykey;
    }

    if (query.where) {
        where = query.where.split(';');
    }

    if (query.columns) {
        fetchOptions.columns = query.columns
            .split(';')
            .filter(el => Schema.find(x => x.toLowerCase() == el.toLowerCase()));
    }

    if (query.relateds) {
        relateds = query.relateds
            .split(';')
            .filter(el => {
                const r = el.split('.')[0];
                Relations.find(x => x.toLowerCase() == r.toLowerCase());
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
exports.getOptions = getOptions;

//raw sql
exports.queryRaw = async function(query, params = {}) {
    try {
        const result = await knex.raw(query, params); 
        return result[0];
    } catch (error) {
        throw(handleError(error));
    }
};

//raw paginate
function makePaginateRaw(registers, pagination = {page: 1, pageSize: 10}) {
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
};
exports.makePaginateRaw = makePaginateRaw;

//tratar erros
function handleError(err) {
    console.log(err);
    return {
        code: err.code,
        errno: err.errno,
        message: err.message || err.sqlMessage || null
    };
}
exports.handleError = handleError;

//criar objeto para create/update
exports.makeObjToSave = async function(Schema, data){
    let obj = {};
    Schema.forEach((column) => {
        if (data[column]) obj[column] = data[column];
    })
    return obj;
}