import * as fs from 'fs';
import {logMessage, runCommand, catchError, createRepo} from '@gitsync/test';
import commit from '..';

describe('commit command', () => {
  test('run commit', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.addFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
        }
      ]
    }));

    await source.commitFile('package-name/test.txt');

    await runCommand(commit, source, {
      sourceDir: 'package-name',
    });

    expect(fs.existsSync(target.getFile('test.txt'))).toBeTruthy();
  });

  test('config file does not exist', async () => {
    const source = await createRepo();

    const error = await catchError(async () => {
      await runCommand(commit, source, {
        sourceDir: 'package-name',
      });
    });

    expect(error).toEqual(new Error('Config file ".gitsync.json" does not exist.'));
  });

  test('config dir not found', async () => {
    const source = await createRepo();

    await source.addFile('.gitsync.json', '{}');

    await runCommand(commit, source, {
      sourceDir: 'package-name',
    });

    expect(logMessage()).toContain('No directories found after filtering "package-name"');
  });

  test('allow repository dir not found', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.commitFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
        }
      ]
    }));

    const error = await catchError(async () => {
      await runCommand(commit, source, {
        sourceDir: 'package-name',
      });
    });

    expect(error).toBeUndefined();
  });

  test('sourceDir with trailing slashes', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.addFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
        }
      ]
    }));

    await source.commitFile('package-name/test.txt');

    await runCommand(commit, source, {
      sourceDir: 'package-name/',
    });

    expect(fs.existsSync(target.getFile('test.txt'))).toBeTruthy();
  });
});


