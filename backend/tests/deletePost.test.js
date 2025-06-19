const request = require('supertest');
const app = require('../app');
const postModel = require('../models/postModel');

jest.mock('../models/postModel');

describe('DELETE /api/blogPosts/deletePost/:post_id', () => {
  it('should delete post successfully', async () => {
    postModel.findByIdAndDelete.mockResolvedValue({ _id: '123' });

    const res = await request(app).delete('/api/blogPosts/deletePost/123');

    expect(res.statusCode).toBe(200);
  });

  it('should return 404 if post not found', async () => {
    postModel.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app).delete('/api/blogPosts/deletePost/123');

    expect(res.statusCode).toBe(404);
  });

  it('should handle errors', async () => {
    postModel.findByIdAndDelete.mockImplementation(() => { throw new Error('fail'); });

    const res = await request(app).delete('/api/blogPosts/deletePost/123');

    expect(res.statusCode).toBe(500);
  });
});
