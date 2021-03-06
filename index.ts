import {Arguments, CommandModule} from 'yargs';
import Sync from '@gitsync/sync';
import {Config} from '@gitsync/config';
import log from '@gitsync/log';
import theme from 'chalk-theme';

interface CommitArguments extends Arguments {
  sourceDir: string;
  include: string[];
  exclude: string[];
  yes?: boolean;
}

const command: CommandModule = {
  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  handler: () => {},
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
  },
  yes: {
    describe: 'Whether to skip confirm or not',
    alias: 'y',
    type: 'boolean',
  },
};

command.handler = async (argv: CommitArguments) => {
  const include = argv.include || [];
  const exclude = argv.exclude || [];
  let {sourceDir} = argv;

  const config = new Config();
  config.checkFileExist();

  if (sourceDir) {
    // Remove trailing slash, this is useful on OS X and some Linux systems (like CentOS),
    // because they will automatic add trailing slash when completing a directory name by default
    if (sourceDir !== '/' && sourceDir.endsWith('/')) {
      sourceDir = sourceDir.slice(0, -1);
    }
    include.push(sourceDir);
  }

  const repos = config.filterReposBySourceDir(include, exclude);
  for (const repo of repos) {
    log.info(`Commit to ${theme.info(repo.sourceDir)}`);

    repo.yes = argv.yes;
    repo.plugins = config.getRepoPlugins(repo.plugins);

    try {
      const sync = new Sync();
      /* eslint-disable-next-line no-await-in-loop */
      await sync.sync(repo);
    } catch (e) {
      process.exitCode = 1;
      log.error(`Sync fail: ${e.message}`);
    }
  }

  log.info('Done!');
};

export default command;
