const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/users');
const Chat = require('../models/chats');


//const newChat = { users: ['fakeid1', 'fakeid2'], title: 'fakeTitle', messages: [] };
const myChat = { token : '-iX_Q1hRBYopsMKtf7ZmMOcOgOBOxIow', userIdInvite : 'fakeid2', title : 'fakeTitle' };

it('POST /chats/creeUneDiscussion', async () => {
    const res = await request(app).post('/chats/creeUneDiscussion').send(myChat);    
    expect(res.statusCode).toEqual(200);
    expect(res.body.result).toEqual(true);
    expect(res.body.idDiscussion).toBeDefined();
} 
)