const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const typeDefs = gql`
    type Brand @key(fields: "id") {
        id: ID!
        name: String
    }

    extend type Product @key(fields: "upc") {
        upc: String! @external
    }

    extend type Variant @key(fields: "sku") {
        sku: String! @external
        product: Product @external
        sizeId: String @external
        size: Size @requires(fields: "product { brand { id } } sizeId")
    }

    type Size @key(fields: "id") {
        id: String!
        name: String
    }
`;

const resolvers = {
    Variant: {
        size(variant) {
            return sizeByBrandId[variant.product.brand.id].find(
                (size) => size.id === variant.sizeId,
            );
        },
    },
    Brand: {
        __resolveReference(object) {
            return brands.find((brand) => brand.id === object.id);
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

server.listen({ port: 4005 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});

const brands = [
    { id: '1', name: 'A' },
    { id: '2', name: 'B' },
    { id: '3', name: 'C' },
    { id: '4', name: 'D' },
    { id: '5', name: 'E' },
];

const sizeByBrandId = {
    1: [{ id: '1', name: 'S' }],
    2: [{ id: '1', name: 'S' }],
    3: [{ id: '1', name: 'S' }],
    4: [{ id: '1', name: 'S' }],
    5: [{ id: '1', name: 'S' }],
};
