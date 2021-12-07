const users = [];

const addUser = ({ id, username, room }) => {
  // clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  // Validate
  if (!username || !room) {
    return {
      error: 'Username and room is required',
    };
  }
  // Check exits user yet?
  const existingUser = users.find(
    (user) => user.username === username && user.room === room
  );

  // Validate
  if (existingUser) {
    return {
      error: 'Username has been taken',
    };
  }

  // Store
  const user = { id, username, room };
  users.push(user);
  return user;
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0]; // return new array delete -> [0] get obj in arr
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  if (!user) return undefined;

  return user;
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  const user = users.filter((user) => user.room === room);
  if (!user) return [];
  return user;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
