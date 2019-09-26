import {Arguments, CommandModule} from 'yargs';
import Sync from '@gitsync/sync';
import {Config} from '@gitsync/config';
import log from '@gitsync/log';
import theme from 'chalk-theme';

interface CommitArguments extends Arguments {
  sourceDir: string
  include: string[]
  exclude: string[]
}

let command: CommandModule = {
  handler: () => {
  }
};

command.command = 'commit [source-dir]';

command.describe = 'Sync current repository subdirectories to relative repositories that defined in the config file';

command.builder = {
  'source-dir': {
    describe: 'Include only source directory matching the given glob, use --include if require multi globs',
    default: '',
    type: 'string',
  },
  include: {
    describe: 'Include only source directory matching the given glob',
    default: [],
    type: 'array',
  },
  exclude: {
    describe: 'Exclude source directory matching the given glob',
    default: [],
    type: 'array',
  }
};

command.handler = async (argv: CommitArguments) => {
  argv.include || (argv.include = []);
  argv.exclude || (argv.exclude = []);

  const config = new Config();
  config.checkFileExist();

  if (argv.sourceDir) {
    // Remove trailing slash, this is useful on OS X and some Linux systems (like CentOS),
    // because they will automatic add trailing slash when completing a directory name by default
    if (argv.sourceDir !== '/' && argv.sourceDir.endsWith('/')) {
      argv.sourceDir = argv.sourceDir.slice(0, -1);
    }
    argv.include.push(argv.sourceDir);
  }

  const repos = config.filterReposBySourceDir(argv.include, argv.exclude);
  for (const repo of repos) {
    log.info(`Commit to ${theme.info(repo.sourceDir)}`);
    try {
      const sync = new Sync();
      await sync.sync(repo);
    } catch (e) {
      process.exitCode = 1;
      log.error(`Sync fail: ${e.message}`);
    }
  }

  log.info('Done!');
}

export default command;
