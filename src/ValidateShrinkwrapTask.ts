import { GulpTask } from '@microsoft/gulp-core-build';
import gulpType = require('gulp');
import * as path from 'path';

type ShrinkwrapDep = { [name: string]: { version: string } };
type PackageDep = { [name: string]: string };

interface INpmPackage {
  dependencies: PackageDep;
  devDependencies: PackageDep;
}

interface INpmShrinkwrap {
  dependencies: ShrinkwrapDep;
}

/**
 * This task attempts to detect if package.json file has been updated without the
 * shrinkwrap file being regenerated.
 *
 * It does this by checking that every dependency and dev dependency exists in the
 * shrinkwrap file and that the version in the shrinkwrap file satisfies what is
 * defined in the package.json file.
 */
export class ValidateShrinkwrapTask extends GulpTask<{}> {
  public name: string = 'Validate Shrinkwrap Freshness';

  public executeTask(gulp: gulpType.Gulp): NodeJS.ReadWriteStream {
    const pathToPackageJson: string = path.join(this.buildConfig.rootPath, 'package.json');
    const pathToShrinkwrap: string = path.join(this.buildConfig.rootPath, 'npm-shrinkwrap.json');

    if (!this.fileExists(pathToPackageJson)) {
      this.logError('Failed to find package.json at ' + pathToPackageJson);
      return;
    } else if (!this.fileExists(pathToShrinkwrap)) {
      this.logError('Failed to find package.json at ' + pathToShrinkwrap);
      return;
    }

    const packagejson: INpmPackage = require(pathToPackageJson);
    const shrinkwrapjson: INpmShrinkwrap = require(pathToShrinkwrap);
    const semver: SemVerStatic = require('semver');

    this._validate(semver, packagejson.dependencies, shrinkwrapjson.dependencies);
    this._validate(semver, packagejson.devDependencies, shrinkwrapjson.dependencies);

    return;
  }

  private _validate(semver: SemVerStatic, packageDep: PackageDep, shrinkwrapDep: ShrinkwrapDep): void {
    for (let pkg in packageDep) {
      if (!shrinkwrapDep.hasOwnProperty(pkg)) {
        this.logError(`Failed to find package ${pkg} in shrinkwrap file`);
      } else if (!semver.satisfies(shrinkwrapDep[pkg].version, packageDep[pkg])) {
        this.logError(`Shrinkwrap version for ${pkg} (${shrinkwrapDep[pkg].version}) does not
          satisfy package.json version of ${packageDep[pkg]}.`);
      }
    }
  }
}
