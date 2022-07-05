# Nest Deployment on App Service Linux

## Local Development

1. Setup a local environment starting with Nest CLI

   `npm i -g @nestjs/cli`

2. Create a workspace and initial application with:

   `nest new project-name`

3. Once the installation is done, cd into project-name folder and then start the srever using:

   `npm run start`

4. Browse the site with `http://localhost:3000` to get the default page.

5. Edit src/main.ts and add `process.env.PORT` in `app.listnen()` function to aviod a hardcoded port for Azure App Service.

   `await app.listen(process.env.PORT || 3000)`



### Deployment Options

There are multiple deployment options in App Service Linux as Continuous Deployment(GitHub/GitHub Actions, Bitbucket, Azure Repos, External Git, Local Git), Run from Package, FTP, etc.



#### Local Git

When using Local Git, you are using `App Service Build Service` also named as Oryx to build your application.

To setup this option and deploy an angular app follow the next steps:

1. Navigate to your web-app and select `Deployment Center` and then click on `Local Git` and then click on `Save`.

2. Copy the remote git repository from Azure Portal.

3. In your local terminal run the following commands in order:

   ```
   git add .
   
   git commit -m "Initial Commit"
   
   git remote add azure https://<sitename>.scm.azurewebsites.net:443/<sitename>.git
   
   git push azure master
   ```

4. Then Oryx will build your application.

5. Add a startup command to avoid having the container recompile Typescript before starting:

   `(Recommended) pm2 start dist/main.js --no-daemon`

   `npm run start:prod`

   `node dist/main`

#### GitHub Actions

You can quickly get started with GitHub Actions by using the App Service Deployment Center. This will automatically generate a workflow file based on your application stack and commit it to your GitHub repository in the correct directory. You can deploy a workflow manually using deployment credentials.

[Use the Deployment Center](https://docs.microsoft.com/en-us/azure/app-service/deploy-github-actions?tabs=applevel#use-the-deployment-center)

[Set up a workflow manually](https://docs.microsoft.com/en-us/azure/app-service/deploy-github-actions?tabs=applevel#set-up-a-workflow-manually])

For Nest deployments is recommended to modify the default template with the following recommendations:

1. Nest can create symbolic links to npm executables, you can include the symlinks when uploading the artifacts between jobs in the GitHub Agent.
2. Compress and archive artifacts into a single zip file since Nest node_modules are big.
3. Remove any npm run test if necessary.
4. Validate current nodejs version.

Here is an example with recommendations:

name: Build and deploy Node.js app to Azure Web App - sampleapp



```yaml
name: Build and deploy Node.js app to Azure Web App - <appname>

on:
   push:
      branches:
         - master
   workflow_dispatch:

jobs:
   build:
      runs-on: ubuntu-latest

      steps:
         - uses: actions/checkout@v2

         - name: Set up Node.js version
           uses: actions/setup-node@v1
           with:
              node-version: '16.x'

         - name: npm install, build, and test
           run: |
              npm install
              npm run build --if-present
         #          npm run test --if-present

         - name: Zip all files for upload between jobs
           run: zip --symlinks -r nest.zip ./*

         - name: Upload artifact for deployment job
           uses: actions/upload-artifact@v2
           with:
              name: node-app
              path: nest.zip

   deploy:
      runs-on: ubuntu-latest
      needs: build
      environment:
         name: 'Production'
         url: ${{ yourown.webapp-url }}

      steps:
         - name: Download artifact from build job
           uses: actions/download-artifact@v2
           with:
              name: node-app

         - name: 'Deploy to Azure Web App'
           id: deploy-to-webapp
           uses: azure/webapps-deploy@v2
           with:
              app-name: 'saazne'
              slot-name: 'Production'
              publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_restofsecrets }}
              package: nest.zip

         - name: Delete zip file
           run: rm nest.zip
```

After the deployement, add a startup command to avoid having the container recompile Typescript before starting like **Local Git**.

`(Recommended) pm2 start dist/main.js --no-daemon`

`npm run start:prod`

`node dist/main`

[Reference](https://azureossd.github.io/2022/02/11/Nest-Deployment-on-App-Service-Linux/index.html)


