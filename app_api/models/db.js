const mongoose = require('mongoose');
const readline = require('readline');

mongoose.set("strictQuery", false);

const dbPassword = process.env.MONGODB_PASSWORD || process.env.DB_PASSWORD;
if (!dbPassword) {
  console.error('MONGODB_PASSWORD or DB_PASSWORD is not set in .env');
  process.exit(1);
}

console.log('Attempting to connect with user: user');
console.log('Cluster: cluster0.sf6zdtr.mongodb.net');
console.log('Database: Loc8r');

const dbURI = `mongodb+srv://user:${encodeURIComponent(dbPassword)}@cluster0.sf6zdtr.mongodb.net/Loc8r`;

const connect = () => {
  mongoose.connect(dbURI)
    .then(() => console.log('Initial connection successful'))
    .catch(err => {
      console.error('Initial MongoDB connection error:', err.message);
      setTimeout(connect, 3000);
    });
};

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', err => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected');
});

if (process.platform === 'win32') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on('SIGINT', () => {
    process.emit("SIGINT");
  });
}

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close()
    .then(() => {
      console.log(`Mongoose disconnected through ${msg}`);
      callback();
    })
    .catch(err => {
      console.error('Error during mongoose disconnection:', err);
      callback();
    });
};

process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});

connect();

require('./location');
