const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Template
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Query
// Tách query string thành key object
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true, // bỏ dấu "?"
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('onlineUsers', ({ users, room }) => {
  const html = Mustache.render(sidebarTemplate, {
    users,
    room,
  });
  document.querySelector('.chat__sidebar').innerHTML = html;
});

socket.on('locationMessage', (url) => {
  const html = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // disable
  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = $messageFormInput.value;
  socket.emit('sendMessage', message, (error) => {
    // enable
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) return console.log(error);
    console.log('Message was sent');
  });
});

document.querySelector('#send-location').addEventListener('click', () => {
  if (!navigator.geolocation) return alert('This browser is not support');

  $sendLocation.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocation.removeAttribute('disabled', 'disabled');
        console.log('Shared location');
      }
    );
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert('username has been taken on room');
    location.href = '/';
  }
});
