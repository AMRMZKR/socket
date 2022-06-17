# UGC-SOCKET

## How to run?
- do `docker-compose up`
- cd into client folder, do `npm run install` and `npm run dev`
- site will be available on localhost:3000

Note: do `docker-compose up` if you need just the socket server


## Events from/to Client
1. content-room
  payload:
```
{
    status: status of event
    user: user's email
    role: user's role
    token: token for takeover (can be null on all except takeover status)
}
```

### Status Used
- connect
- locked-admin: emit to admin user
- locked-user: emit to creator user
- takeover: sent by admin only
- takeover-complete: after admin takeover
- leave-room-admin: emit to admin user
- leave-room-user: emit to creator user
- invalid-token: emit when takeover token mismatch

### Important Note
make sure client handle disconnect on certain event status as server will not be doing that