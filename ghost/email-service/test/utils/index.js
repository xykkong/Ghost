const ObjectId = require('bson-objectid').default;
const sinon = require('sinon');

const createModel = (propertiesAndRelations) => {
    const id = propertiesAndRelations.id ?? ObjectId().toHexString();
    return {
        id,
        getLazyRelation: (relation) => {
            return Promise.resolve(propertiesAndRelations[relation]);
        },
        get: (property) => {
            return propertiesAndRelations[property];
        },
        save: (properties) => {
            Object.assign(propertiesAndRelations, properties);
            return Promise.resolve();
        },
        toJSON: () => {
            return {
                id,
                ...propertiesAndRelations
            };
        }
    };
};

const createModelClass = (options = {}) => {
    return {
        ...options,
        add: async (properties) => {
            return Promise.resolve(createModel(properties));
        },
        findOne: async (data, o) => {
            if (options.findOne === null && o.require) {
                return Promise.reject(new Error('NotFound'));
            }
            if (options.findOne === null) {
                return Promise.resolve(null);
            }
            return Promise.resolve(
                createModel({...options.findOne, ...data})
            );
        },
        findAll: async (data) => {
            return Promise.resolve(
                (options.findAll ?? []).map(f => createModel({...f, ...data}))
            );
        },
        transaction: async (callback) => {
            const transacting = {transacting: 'transacting'};
            return await callback(transacting);
        },
        where: function () {
            return this;
        },
        save: async function () {
            return Promise.resolve();
        }
    };
};

const createDb = ({first, all} = {}) => {
    let a = all;
    const db = {
        knex: function () {
            return this;
        },
        where: function () {
            return this;
        },
        whereNull: function () {
            return this;
        },
        select: function () {
            return this;
        },
        limit: function (n) {
            a = all.slice(0, n);
            return this;
        },
        update: sinon.stub().resolves(),
        orderByRaw: function () {
            return this;
        },
        insert: function () {
            return this;
        },
        first: () => {
            return Promise.resolve(first);
        },
        then: function (resolve) {
            resolve(a);
        },
        transacting: function () {
            return this;
        }
    };
    db.knex.raw = function () {
        return this;
    };
    return db;
};

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

module.exports = {
    createModel,
    createModelClass,
    createDb,
    sleep
};
