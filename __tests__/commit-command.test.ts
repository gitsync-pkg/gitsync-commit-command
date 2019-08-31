import * as fs from 'fs';
import {createRepo, removeRepos, disableColor, runCommand, catchError} from '../../../packages/sync/__tests__/tester';
import commit from '../index';

beforeAll(() => {
  disableColor();
});

afterAll(() => {
  removeRepos();
});

describe('commit command', () => {
  test('run commit', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.addFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          dir: 'package-name',
          remote: target.dir,
        }
      ]
    }));

    await source.commitFile('package-name/test.txt');

    await runCommand(commit, source, {
      dir: 'package-name',
    });

    expect(fs.existsSync(target.getFile('test.txt'))).toBeTruthy();
  });

  test('config file does not exist', async () => {
    const source = await createRepo();

    const error = await catchError(async () => {
      await runCommand(commit, source, {
        dir: 'package-name',
      });
    });

    expect(error).toEqual(new Error('Config file ".gitsync.json" does not exist.'));
  });

  test('config dir not found', async () => {
    const source = await createRepo();

    await source.addFile('.gitsync.json', '{}');

    const error = await catchError(async () => {
      await runCommand(commit, source, {
        dir: 'package-name',
      });
    });

    expect(error).toEqual(new Error('Directory "package-name" does not exist in config file.'));
  });

  test('repository dir not found', async () => {
    const source = await createRepo();
    const target = await createRepo();

    await source.addFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          dir: 'package-name',
          remote: target.dir,
        }
      ]
    }));

    const error = await catchError(async () => {
      await runCommand(commit, source, {
        dir: 'package-name',
      });
    });

    expect(error).toEqual(new Error('Directory "package-name" does not exist in current repository.'));
  });
});


