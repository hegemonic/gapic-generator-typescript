// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as assert from 'assert';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { describe, it } from 'mocha';
import { equalToBaseline } from '../util';

const cwd = process.cwd();

const OUTPUT_DIR = path.join(cwd, '.test-out-dlp');
const GOOGLE_GAX_PROTOS_DIR = path.join(
  cwd,
  'node_modules',
  'google-gax',
  'protos'
);
const PROTOS_DIR = path.join(cwd, 'build', 'test', 'protos');
const DLP_PROTO_FILE = path.join(
  PROTOS_DIR,
  'google',
  'privacy',
  'dlp',
  'v2',
  '*.proto '
);

const COMMON_PROTO_FILE = path.join(
  PROTOS_DIR,
  'google',
  'cloud',
  'common_resources.proto'
);

const BASELINE_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'typescript',
  'test',
  'testdata'
);

const BASELINE_DIR_KM = path.join(BASELINE_DIR, 'dlp');
const SRCDIR = path.join(cwd, 'build', 'src');
const CLI = path.join(SRCDIR, 'cli.js');
const PLUGIN = path.join(SRCDIR, 'protoc-gen-typescript_gapic');

describe('LibraryWithMultiplePatternResourceGenerateTest', () => {
  describe('Generate Client library', () => {
    it('Generated client library with multiple pattern resource should have same output with baseline.', function() {
      this.timeout(60000);
      if (fs.existsSync(OUTPUT_DIR)) {
        rimraf.sync(OUTPUT_DIR);
      }
      fs.mkdirSync(OUTPUT_DIR);

      if (fs.existsSync(PLUGIN)) {
        rimraf.sync(PLUGIN);
      }
      fs.copyFileSync(CLI, PLUGIN);
      process.env['PATH'] = SRCDIR + path.delimiter + process.env['PATH'];

      try {
        execSync(`chmod +x ${PLUGIN}`);
      } catch (err) {
        console.warn(`Failed to chmod +x ${PLUGIN}: ${err}. Ignoring...`);
      }

      execSync(
        `protoc --typescript_gapic_out=${OUTPUT_DIR} ` +
          `-I${GOOGLE_GAX_PROTOS_DIR} ` +
          `-I${PROTOS_DIR} ` +
          DLP_PROTO_FILE +
          COMMON_PROTO_FILE
      );
      assert(equalToBaseline(OUTPUT_DIR, BASELINE_DIR_KM));
    });
  });
});