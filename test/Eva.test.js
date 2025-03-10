const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

const newReservation = {
  name: "MEERT",
  token: "-iX_Q1hRBYopsMKtf7ZmMOcOgOBOxIow",
  users: ["67c979951277b8acd792fed9"],
  date: "2025-03-10T12:30:00Z",
  conversation: '67c9861ee473f19d955e8c2f',
  restaurantId: '67c978d5733ddf5aa798dee4',
};

it('POST /reservations/add', async () => {
  const res = await request(app).post('/reservations/add').send(newReservation);

  console.log(res.body);

  expect(res.statusCode).toBe(200);
  expect(res.body.Reservations.name).toBe(newReservation.name);
  expect(res.body.Reservations.users).toEqual(newReservation.users);


});
