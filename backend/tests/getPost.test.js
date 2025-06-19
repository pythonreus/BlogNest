const request = require('supertest');
const app = require('../app');
const postModel = require('../models/postModel');

jest.mock('../models/postModel');

describe('GET /api/blogPosts/getPost/:post_id', () => {
  it('should return a single post if found', async () => {
    const mockPost = { _id: '123', post_title: 'Test Post' };
    postModel.findById.mockResolvedValue(mockPost);

    const res = await request(app).get('/api/blogPosts/getPost/123');

    expect(res.statusCode).toBe(200);
    expect(res.body.post).toEqual(mockPost);
  });

  it('should return 404 if post not found', async () => {
    postModel.findById.mockResolvedValue(null);

    const res = await request(app).get('/api/blogPosts/getPost/123');

    expect(res.statusCode).toBe(404);
  });

  it('should handle errors', async () => {
    postModel.findById.mockImplementation(() => { throw new Error('fail'); });

    const res = await request(app).get('/api/blogPosts/getPost/123');

    expect(res.statusCode).toBe(500);
  });
});
