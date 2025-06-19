const request = require('supertest');
const app = require('../app');
const postModel = require('../models/postModel');

jest.mock('../models/postModel');

describe('PUT /api/blogPosts/updateVisibility/:post_id', () => {
  it('should toggle post_visibility and return updated post', async () => {
    const existingPost = { _id: '123', post_visibility: false };
    const updatedPost = { _id: '123', post_visibility: true };

    postModel.findById.mockResolvedValue(existingPost);
    postModel.findByIdAndUpdate.mockResolvedValue(updatedPost);

    const res = await request(app).put('/api/blogPosts/updateVisibility/123');

    expect(res.statusCode).toBe(200);
    expect(res.body.post.post_visibility).toBe(true);
  });

  it('should return 404 if post not found', async () => {
    postModel.findById.mockResolvedValue(null);

    const res = await request(app).put('/api/blogPosts/updateVisibility/123');

    expect(res.statusCode).toBe(404);
  });

  it('should handle errors', async () => {
    postModel.findById.mockImplementation(() => { throw new Error('fail'); });

    const res = await request(app).put('/api/blogPosts/updateVisibility/123');

    expect(res.statusCode).toBe(500);
  });
});
