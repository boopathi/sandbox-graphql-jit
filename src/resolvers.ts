import { GraphQLFieldResolver, GraphQLSchema } from "graphql";
import { Driver, Post, User } from "./driver";

type Resolver = GraphQLFieldResolver<
  any,
  { driver: Driver; schema: GraphQLSchema }
>;

type Resolvers = {
  [key: string]: {
    [key: string]: Resolver;
  };
};

export const resolvers: Resolvers = {
  Query: {
    posts(_1, _2, context) {
      return context.driver.getAllPosts();
    },
    post(_, { id }, context) {
      return context.driver.getPost(id);
    },
    viewer(_1, _2, context) {
      return context.driver.getUser("1");
    },
    user(_, { id }, context) {
      return context.driver.getUser(id);
    },
  },
  Post: {
    author(post: Post, _, context) {
      return context.driver.getUser(post.author);
    },
  },
  User: {
    posts(user: User, _, context) {
      return Promise.all(
        user.posts.map((postId) => context.driver.getPost(postId))
      );
    },
  },
};
