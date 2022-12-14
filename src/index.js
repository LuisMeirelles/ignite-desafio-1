const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response
      .status(404)
      .json({ error: 'The requested user was not found' });
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return response
      .status(400)
      .json({ error: 'The specified username is already in use' });
  }

  const user = {
    id: uuid(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {
    user,
    body: { title, deadline }
  } = request;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    user,
    body: { title, deadline },
    params: { id }
  } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response
      .status(404)
      .json({ error: 'The requested todo was not found' });
  }

  Object.assign(todo, {
    title,
    deadline: new Date(deadline)
  });

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id }
  } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response
      .status(404)
      .json({ error: 'The requested todo was not found' });
  }

  Object.assign(todo, { done: true });

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    user,
    params: { id }
  } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({
      error: 'The requested todo was not found'
    });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
