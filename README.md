# Getting started
Install using yarn
```
yarn add git+https://github.com/venturehacks/appstore-api-js-client
```
Install using npm
```
npm install git+https://github.com/venturehacks/appstore-api-js-client
```
Import and initialize the client:
```
import angelListAppstoreApiClient from 'angellist-appstore-api-js-client';

const client = angelListAppstoreApiClient({
 apiKey: 'YOUR-API-KEY',
 env: process.env.NODE_ENV,
 appSlug: 'my-app',
 userId: '1234',
});
```
Authenticate with the Appstore API:
```
try {
 const { token, user } = await angelListAppstoreApiClient.authenticate();
} catch (err) {
 handleError(err);
}
```
A successful authentication will return a `token` to include in subsequent requests as well as a `user` object containing any user properties your application has been granted permission to read. An unsuccessful authentication will throw an error that your application can catch and handle as you see fit.

Get user data:
```
try {
 const key = 'score';
 const data = await angelListAppstoreApiClient.getUserData({ token, key });
 const score = data[key];
} catch (err) {
 handleError(err)
}
```
Set user data:
```
try {
 const key = 'score';
 const value = 100;
 await angelListAppstoreApiClient.setUserData({ token, key, value });
} catch (err) {
 handleError(err)
}
```
Submit:
```
try {
 await angelListAppstoreApiClient.submit({ token });
} catch (err) {
 handleError(err)
}
```
# Running tests
This project uses [Jest](https://github.com/facebook/jest) to run automated tests. In order to run the suite, from the project directory, first install all packages:
```
yarn install
```
Then:
```
yarn test
```
