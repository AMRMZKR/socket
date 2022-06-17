<template>
  <div class="container mx-auto">
    <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 ">
      <div>
        Join as:
        <br />
        <input type="radio" id="admin" value="admin" v-model="role">
        <label for="admin">Admin</label><br>
        <input type="radio" id="creator" value="creator" v-model="role">
        <label for="creator">Creator</label><br>
      </div>
      <div>
        <br />
        <label for="name">Name:</label>
        <input type="text"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          v-model="user" />
      </div>
      <br />
      <div>
        Article ID
        <input type="text"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          v-model="articleId" />
      </div>
      <div class="mt-2">
        <button v-if="!socket" @click="join" type="button"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Join
        </button>
        <button v-else @click="leave" type="button"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Leave
        </button>
      </div>

    </form>

  </div>
</template>

<script>
const { io } = require("socket.io-client");
export default {
  name: 'IndexPage',
  data() {
    return {
      socket: null,
      articleId: null,
      user: null,
      role: null
    }
  },
  methods: {
    join() {
      this.socket = io('http://localhost:4040', {
        transports: ['websocket'],
        query: {
          articleId: this.articleId
        }
      });

      /** 
       * content-room object payload
       * {
       *  status: status of event
       *  user: user's email
       *  role: user's role
       *  token: token to be used during takeover
       *  time: current time to detect how long user has been in the room (for future use)
       * }
      */
      this.socket.emit('content-room', {
        status: 'connect',
        user: this.user,
        role: this.role,
        token: null,
        time: Date.now()
      })

      this.socket.on('content-room', ({ status, by, token }) => {
        switch (status) {
          case 'locked-admin':
            if (confirm(`${by} is currently editing this post. Do you want to take over?`)) {
              this.socket.emit('content-room', {
                status: 'takeover',
                user: this.user,
                role: this.role,
                token: token
              })
            } else {
              alert('you pressed cancel');
              this.leave();
            }
            break;
          case 'locked-user':
            alert('Your post is currently being reviewed by an Admin. You will not be able to make any changes at this time.')
            this.leave();
            break;
          case 'takeover-complete':
            alert('you got it bro. good job')
            break;
          case 'leave-room-admin':
            alert(`This post has been taken over by ${by}`);
            this.leave();
            break;
          case 'leave-room-user':
            alert('Your post is currently being reviewed by an Admin. You will not be able to make any changes at this time.');
            this.leave();
            break;
          case 'invalid-token':
            alert('invalid token');
            this.leave();
            break;
        }
      })
    },
    leave() {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
</script>
