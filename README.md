# Turing ecommerce

### Project structure

The project is structured with the folders:
  - backend
  - frontend

In a real project, each folder would be an isolated git repository and the root
folder would be a git repository with submodules.

_backend_ include the code for the backend and _frontend_ is a React mock to
allows registration, authentication (email and password, Facebook) and payment with Stripe

### Backend
The _backend_ is implemented using **GraphQL** instead of **REST API** with the help of **Apollo Server** and the adoption of [GraphQL Relay specs](https://facebook.github.io/relay/docs/en/graphql-server-specification.html).

**GraphQL** is a good choice for an ecommerce because most user interactions involve viewing records and not creating them. This scenario is perfect for implementing a client side cache system, and with GraphQL and [Apollo Client](https://www.apollographql.com/docs/) (available for different platforms) is super easy.

You can find the backend at https://graphql-turing-ecommerce.geekcups.com. In this environment you can find a [GraphQL Playground](https://github.com/prisma/graphql-playground) at https://graphql-turing-ecommerce.geekcups.com/graphql where you can explore the graph and the schema documentation using this tool.

#### Folder structure

The folder structure is:
- **app**: the backend code.
  - **dataloaders**: implementation of [Facebook dataloaders](https://github.com/facebook/dataloader) for sequelize
  - **errors**: enums for possible backend errors
  - **graphql**: all the graphql stuffs.
    - **filters**: all the filters used to filter the data in the connections types
    - **inputs**: all the custom input type for the mutations
      - **interface**: all the GraphQL interface types. In this case only the GraphQL Relay Node interface
      - **mutations**: all the GraphQL mutations grouped by "feature". Each mutation define her input type and her output type.
      - **types**: all the GraphQL types.
    - **query.js**: the GraphQL Query type
    - **mutation.js**: the GraphQL Mutation type
  - **models**: all the backend models. In this case we had only sequelize models
  - **policies**: all the authorization rules for the backend
  - **utils**: all the utils
- **config**: all the config for each environments. env variables will be used.
- **initializers**: all the initilizers for the backend. This files will be executed only onced at backend startup.
- **mailTemplates**: email templates
- **specs**: test related files, including factories

#### Error handling

Errors are teated with GraphQL, so the server return always 200 with the detail of error in the _errors_ array contained in the response.

If the server response is a 400, it means that you write a wrong GraphQL query or you don't specify a required attribute (those with ! at the end)

If the server response is a 500, it means that the server is hard crashed.

Be sure to use the id returned by the server in every required ID field. If you specify a self generated id you may occurs in a 500 response.

#### Data access

I'm not a big fan of raw SQL queries and stored procedure in the code, so i adapt [Sequelize ORM](http://docs.sequelizejs.com/) to the existing database and none of the provided store procedure was used in the backend.

Backend caching is implemented **per request** with the Sequelize implementation of Facebook dataloaders. All the GraphQL queries use this dataloaders to load data, so we can implement whatever caching mechanism inside dataloaders (e.g. second level cache with Redis).

#### Authentication, Authorization and security

Authentication is handled using [Firebase Authentication](https://firebase.google.com/docs/auth/). I implemented only:
- User and password registration and login
- Anonymous authentication (helpful for analytics purpose)
- Facebook login

With firebase we can later implement password recovery, user confirmation email, other login provider, etc.

The JWT token returned by Firebase is used to access GraphQL. You must set the value of the Authorization header of the request like:

```
Bearer firebaseJWTToken
```

Authorization is handled by policies to centralize that logic.

For testing purpose authorization is handled by email domain. **Any user that have an email that ends with @admin.com is an ADMIN**

To avoid DOS attack the server has a rate limit (in memory for testing purpose, but another store can be used).

To avoid XSS attack the server has cors rules (every domain is enabled for testing purpose).


#### Testing

[Jest](https://jestjs.io/) is the testing framework used in this project. You can find all tests in the \_\_tests\_\_ folders.

[Factory Girl](https://github.com/aexmachina/factory-girl) was used to create sample models to run the tests. In the test environment a sqlite database is used, but a better choice is an in memory database or mocking all the ORM. I decide to use a sqlite database because i'm not very confident with Sequelize and SQL in a NodeJs project and with a real database I was able to experiment and familiarize with Sequelize.

#### Development

You can easy run the code on your machine using Docker with the provided docker-compose.yml. The template for the env files can be found in the *envFiles* folder.

### Frontend

The "frontend" can be found at https://frontend-turing-ecommerce.geekcups.com. It is a functional super base React app that permits registration, login and payment with Stripe.

### Advanced requirements
1. The current system can support 100,000 daily active users. How do you design a new system to support 1,000,000 daily active users?

    Most of the code can remain the same. The mandatory steps are, excluding database scaling:
      - Scale up the backend code across different machines
      - Implement a different dataloaders that can store object across different machine (e.g. using a redis cache)
      - Store some data (e.g. products name, description and attributes) in a information retrieval system (e.g. ElasticSearch) and change the filters (**/app/graphql/filters**) that insist on the ElasticSearch and not on the database.

2. A half of the daily active users comes from United States. How do you design a new system to handle this case?

    Most of the code can remain the same. The mandatory steps are:
      - Deploy the backend code in one or more machines in the United States
      - Store images in a CDN located in the United States
