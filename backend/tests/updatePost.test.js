const request = require('supertest');
const app = require('../app');
const postModel = require('../models/postModel');

jest.mock('../models/postModel');

describe('PUT /api/blogPosts/updatePost/:post_id', () => {
  it('should update and return the post', async () => {
    const updatedPost = { _id: '123', post_title: 'Updated Title' };
    postModel.findByIdAndUpdate.mockResolvedValue(updatedPost);

    const res = await request(app)
      .put('/api/blogPosts/updatePost/123')
      .send({ post_title: 'Updated Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body.post).toEqual(updatedPost);
  });

  it('should return 404 if post not found', async () => {
    postModel.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/blogPosts/updatePost/123')
      .send({ post_title: 'Updated Title' });

    expect(res.statusCode).toBe(404);
  });

  it('should handle errors', async () => {
    postModel.findByIdAndUpdate.mockImplementation(() => { throw new Error('fail'); });

    const res = await request(app)
      .put('/api/blogPosts/updatePost/123')
      .send({ post_title: 'Updated Title' });

    expect(res.statusCode).toBe(500);
  });
});
