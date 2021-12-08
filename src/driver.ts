import fetch from "node-fetch";

/**
 * These are free to use APIs with some rate limits that provide
 * randomly generated user and post data for testing
 */
const randomUserUrl = "https://randomuser.me/api/?results=10";
const randomPostsUrl = "https://jsonplaceholder.typicode.com/posts/";

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  posts: string[];
}

export interface Post {
  id: string;
  title: string;
  contents: string;
  author: string;
}

export class Driver {
  private users = new Map<string, User>();
  private posts = new Map<string, Post>();

  async init() {
    await this.populateUsers();
    await this.populatePosts();
    this.assignPostsForUsers();
  }

  async getUser(id: string) {
    return this.users.get(id);
  }
  async getPost(id: string) {
    return this.posts.get(id);
  }
  async getAllPosts() {
    return this.posts.values();
  }

  private async populateUsers() {
    const resp = await fetch(randomUserUrl);
    const body = (await resp.json()) as { results: any[] };
    for (const [i, user] of body.results.entries()) {
      const id = `${i + 1}`;
      this.users.set(id, {
        id,
        name: user.name.first + " " + user.name.last,
        email: user.email,
        profilePicture: user.picture.large,
        posts: [], // filled later
      });
    }
  }

  private async populatePosts() {
    const resp = await fetch(randomPostsUrl);
    const body = (await resp.json()) as any[];
    for (const post of body) {
      const id = `${post.id}`;
      this.posts.set(id, {
        id,
        title: post.title,
        contents: post.body,
        author: `${post.userId}`,
      });
    }
  }

  private assignPostsForUsers() {
    for (const [id, post] of this.posts) {
      const author = this.users.get(post.author);
      if (author) author.posts.push(id);
    }
  }
}
