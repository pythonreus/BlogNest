const request = require('supertest');
const app = require('../app');
const postModel = require('../models/postModel');

jest.mock('../models/postModel');

describe('POST /api/blogPosts/createPost', () => {
  it('should create a new post successfully', async () => {
    const newPost = {
      post_title: 'New Post',
      post_author: 'Author',
      post_category: 'Category',
      post_content: 'Content here',
    };

    postModel.prototype.save = jest.fn().mockResolvedValue({
      ...newPost,
      _id: '123',
      post_visibility: false,
    });

    const res = await request(app).post('/api/blogPosts/createPost').send(newPost);

    expect(res.statusCode).toBe(201);
    expect(res.body.post.post_title).toBe('New Post');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/blogPosts/createPost').send({});

    expect(res.statusCode).toBe(400);
  });

  it('should handle errors', async () => {
    postModel.prototype.save = jest.fn().mockImplementation(() => { throw new Error('fail'); });

    const res = await request(app).post('/api/blogPosts/createPost').send({
      post_title: 'Title',
      post_author: 'Author',
      post_category: 'Cat',
      post_content: 'Content',
    });

    expect(res.statusCode).toBe(500);
  });
});
