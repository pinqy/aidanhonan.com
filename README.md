# aidanhonan.com
https://aidanhonan.com/

## Deploying Changes

Before deploying any changes, **<u>make sure</u>** to run `ng build` and include the `dist/` folder in your commit, otherwise the changes you make will not take effect.

When making changes, after testing locally, you can first deploy them to test.aidanhonan.com
1. `git checkout -b test`
2. Commit changes
3. `git push -u origin test`
4. Pull and deploy changes in cPanel repository `aidanhonan.com-test`
5. Test on test.aidanhonan.com
   1. To update the page quickly, go to CloudFlare Console -> Caching -> Configuration -> Purge Cache (Custom Purge) and purge https://www.test.aidanhonan.com

When you're ready to deploy changes to mainline
1. `gh pr create --draft --title "<title>"`
2. Populate the pull-request with details in GitHub
3. Merge the pull-request
4. Pull and deploy changes in cPanel repository `aidanhonan.com`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
