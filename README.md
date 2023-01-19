# passport-local-demo

A minimal implementation of an Express server using PassportJS with LocalStrategy, which *renders the authentication failure messages in the View*.

## Why?

I wanted to share this simple example because I had a heck of a time finding documentation for how `failureMessage` even worked, let alone an implementation that didn't require custom callbacks for `passport.authenticate()`.

## Running Locally

You will need to provide your own `.env` file and a MongoDB database to connect to. An example `.env` file has been included; the only necessary variables are `MONGODB_URI` (your MongoDB database connection string) and `SESSION_SECRET` (which can be anything).

Once you have your `.env` file and database ready, to start:

```
npm run start # run with node
npm run dev   # run with nodemon
```
