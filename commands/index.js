'use strict';

/* eslint-disable no-console */
const SilentError = require('silent-error');
const fs = require('fs');
const path = require('path');

const SHARED = {
  _ensureConfigFile() {
    try {
      return this.project.resolveSync('config/optional-features.json');
    } catch(err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
    }

    try {
      this.project.resolveSync('config/optional-features');
      throw new SilentError('This command only works with `config/optional-features.json` currently. Pull request welcome.');
    } catch(err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
    }

    let configPath = path.join(this.project.root, 'config', 'optional-features.json');

    fs.writeFileSync(configPath, '{}', { encoding: 'UTF-8' });

    return configPath;
  },

  _setFeature(name, value) {
    let configPath = this._ensureConfigFile();
    let configJson = fs.readFileSync(configPath, { encoding: 'UTF-8' });
    let config = JSON.parse(configJson);
    config[name] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), { encoding: 'UTF-8' });
  }
};

const ENABLE_FEATURE = Object.assign({
  name: 'feature:enable',
  description: 'Enable feature.',
  works: 'insideProject',
  anonymousOptions: [
    '<feature-name>'
  ],
  run(_, args) {
    this._setFeature(args[0], true);
  }
}, SHARED);

const DISABLE_FEATURE = Object.assign({
  name: 'feature:disable',
  description: 'Disable feature.',
  works: 'insideProject',
  anonymousOptions: [
    '<feature-name>'
  ],
  run(_, args) {
    this._setFeature(args[0], false);
  }
}, SHARED);

module.exports = {
  "feature:enable": ENABLE_FEATURE,
  "feature:disable": DISABLE_FEATURE
}
