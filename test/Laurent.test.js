const request = require('supertest');
const app = require('../app');

const myChat = { token : '-iX_Q1hRBYopsMKtf7ZmMOcOgOBOxIow', userIdInvite : 'fakeid2', title : 'fakeTitle' };

it('POST /chats/creeUneDiscussion', async () => {
    const res = await request(app).post('/chats/creeUneDiscussion').send(myChat);    
    expect(res.statusCode).toEqual(200);
    expect(res.body.result).toEqual(true);
    expect(res.body.idDiscussion).toBeDefined();
} 
)






