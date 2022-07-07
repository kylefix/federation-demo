const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const typeDefs = gql`
    extend type Query {
        topProducts(first: Int = 5): [Product]
    }

    type Product @key(fields: "upc") {
        upc: String!
        name: String
        price: Int
        weight: Int
        brand: Brand
        variants: [Variant]
    }

    extend type Brand @key(fields: "id") {
        id: ID! @external
        description: String
    }

    type Variant @key(fields: "sku") {
        sku: String!
        name: String
        sizeId: String
        product: Product
    }

    extend type Size @key(fields: "id") {
        id: String! @external
    }
`;

const resolvers = {
    Size: {
        __resolveReference(object) {
            console.log('hat', object)
        },
    },
    Product: {
        __resolveReference(object) {
            return products.find((product) => product.upc === object.upc);
        },
        variants(product) {
            return product.variants.map((variant) => {
                return {
                    __typename: 'Variant',
                    sku: variant.sku,
                    name: variant.name,
                    product,
                    sizeId: variant.sizeId,
                };
            });
        },
    },
    Query: {
        topProducts(_, args) {
            return products.slice(0, args.first);
        },
    },
};

const server = new ApolloServer({
    schema: buildFederatedSchema([
        {
            typeDefs,
            resolvers,
        },
    ]),
    plugins: [
        {
            requestDidStart(
                requestContext,
            ) {
                const q = requestContext.request.query;

                if (q.includes('__ApolloGetServiceDefinition__')) {
                    return;
                }

                console.log('reference req', q);
            },
        },
    ],
});

server.listen({ port: 4003 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});

const products = [
    {
        upc: '1',
        name: 'Table',
        price: 899,
        weight: 100,
        variants: [
            {
                sku: '1',
                name: 'Red',
                sizeId: '1'
            },
            {
                sku: '2',
                name: 'Blue',
                sizeId: '1'
            },
            {
                sku: '3',
                name: 'Green',
                sizeId: '1'
            },
            {
                sku: '4',
                name: 'Yellow',
                sizeId: '1'
            },
        ],
        brand: {
            id: '1',
            description: 'A',
        },
        size: {
            id: '1',
        },
    },
    {
        upc: '2',
        name: 'Couch',
        price: 1299,
        weight: 1000,
        variants: [
            {
                sku: '1',
                name: 'Red',
                sizeId: '1'
            },
            {
                sku: '2',
                name: 'Blue',
                sizeId: '1'
            },
            {
                sku: '3',
                name: 'Green',
                sizeId: '1'
            },
            {
                sku: '4',
                name: 'Yellow',
                sizeId: '1'
            },
        ],
        brand: {
            id: '1',
            description: 'A',
        },
        size: {
            id: '1',
        },
    },
    {
        upc: '3',
        name: 'Chair',
        price: 54,
        weight: 50,
        variants: [
            {
                sku: '1',
                name: 'Red',
                sizeId: '1'
            },
            {
                sku: '2',
                name: 'Blue',
                sizeId: '1'
            },
            {
                sku: '3',
                name: 'Green',
                sizeId: '1'
            },
            {
                sku: '4',
                name: 'Yellow',
                sizeId: '1'
            },
        ],
        brand: {
            id: '1',
            description: 'A',
        },
    },
];
