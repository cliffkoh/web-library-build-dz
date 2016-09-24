
import { GulpTask } from '@microsoft/gulp-core-build';
import gulpType = require('gulp');
import * as child_process from 'child_process';
import * as rimraf from 'rimraf';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export class GenerateShrinkwrapTask extends GulpTask<{}> {
  public name: string = 'generate-shrinkwrap';

  constructor() {
    super();
  }

  public executeTask(gulp: gulpType.Gulp): NodeJS.ReadWriteStream {
    const pathToNodeModules: string = path.join(this.buildConfig.rootPath, 'node_modules');
    const pathToShrinkwrap: string = path.join(this.buildConfig.rootPath, 'npm-shrinkwrap.json');

    if (fs.existsSync(pathToNodeModules) && !this.buildConfig.args.hasOwnProperty('fast')) {
      this.log(`Deleting node_modules folder: ${pathToNodeModules}/node_modules`);
      this._dangerouslyDeletePath(pathToNodeModules);
    }

    if (this.fileExists(pathToShrinkwrap)) {
      this._dangerouslyDeletePath(pathToShrinkwrap);
    }

    this.log(`Running npm update`);
    child_process.execSync('npm update');
    this.log(`Running npm shrinkwrap`);
    child_process.execSync('npm shrinkwrap');

    return;
  }

  private _dangerouslyDeletePath(folderPath: string): void {
    try {
      rimraf.sync(folderPath);
    } catch (e) {
      throw new Error(`${e.message}${os.EOL}Often this is caused by a file lock from a process
       such as your text editor, command prompt, or "gulp serve"`);
    }
  }
}