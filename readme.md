To setup project:
1. Clone project.
2. Run "npm install" in project root.
3. Run "npm install" in client directory.
4. The app should now be ready to run!

To start the server for production:
1. Create a settings.json with your information in it.
2. Run "npm run prod" in root directory.
3. React will now start to create an optimized production build. Once done it will start the server.

To start the server for development:
1. Create a settings.json with your information in it.
2. If your using a different port than 3001 in settings.json, you have to change the port in "client/package.json" proxy property too.
2. Run "npm start" in root directory.
3. Run "npm run dev" in root directory (secondary process).
4. You can now go to localhost:3000 for react development.
