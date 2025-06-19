const request = require('supertest');
const app = require('../app'); // Adjust path to your Express app
const postModel = require('../models/postModel');

jest.mock('../models/postModel'); // Mock the Mongoose model

describe('GET /api/blogPosts/getPosts', () => {
  it('should return posts with pagination and sorting', async () => {
    const mockPosts = [
      { _id: '1', post_title: 'Test 1', createdAt: new Date() },
      { _id: '2', post_title: 'Test 2', createdAt: new Date() },
    ];
    postModel.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(mockPosts),
    });
    postModel.countDocuments.mockResolvedValue(2);

    const res = await request(app).get('/api/blogPosts/getPosts').query({ page: 1, limit: 10 });

    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(2);
    expect(res.body.totalPosts).toBe(2);
    expect(postModel.find).toHaveBeenCalled();
    expect(postModel.countDocuments).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    postModel.find.mockImplementation(() => { throw new Error('fail'); });

    const res = await request(app).get('/api/blogPosts/getPosts');

    expect(res.statusCode).toBe(500);
  });
});
