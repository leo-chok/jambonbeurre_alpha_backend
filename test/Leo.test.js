const request = require("supertest");
const app = require("../app");
const { matchers } = require("jest-json-schema");

expect.extend(matchers);

it("GET /users/all", async () => {
  const res = await request(app).get("/users/all");

  const expectedSchema = {
    type: "object",
    properties: {
      infos: {
        type: "object",
        properties: {
          username: { type: "string" },
          firstname: { type: "string" },
          lastname: { type: "string" },
          avatar: { type: "string" },
          online: { type: "boolean" },
          location: {
            type: "object",
          },
        },
        required: [
          "username",
          "firstname",
          "lastname",
          "avatar",
          "online",
          "location",
        ],
      },
      authentification: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" },
          token: { type: "string" },
        },
        required: ["email", "password", "token"],
      },


      
      description: {
        type: "object",
        properties: {
          work: { type: "string" },
          bio: { type: "string" },
        },
        required: ["work", "bio"],
      },
      preferences: {
        type: "object",
        properties: {
          favBuddies: { type: "array", items: { type: "string" } },
          favRestaurant: { type: "array", items: { type: "string" } },
          favFood: { type: "array", items: { type: "string" } },
          hobbies: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          holidays: { type: "boolean" },
          lunchtime: {
            type: "array",
          },
        },
        required: [
          "favBuddies",
          "favRestaurant",
          "favFood",
          "hobbies",
          "languages",
          "holidays",
          "lunchtime",
        ],
      },
    },
    required: ["infos", "authentification", "description", "preferences"],
  };

  expect(res.statusCode).toBe(200);
  res.body.listUsers.forEach((user) => {
    expect(user).toMatchSchema(expectedSchema);
  });
});
