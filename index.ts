import {Arguments, CommandModule} from 'yargs';
import Sync from '@gitsync/sync';
import {Config} from '@gitsync/config';

interface CommitArguments extends Arguments {
  sourceDir: string
}

let command: CommandModule = {
  handler: () => {
  }
};

command.command = 'commit <source-dir>';

command.describe = 'Sync the commits from the current repository\'s subdirectory to another repository';

command.builder = {
  sourceDir: {
    describe: 'The subdirectory in current repository',
  }
};

command.handler = (argv: CommitArguments) => {
  const config = new Config();
  config.checkFileExist();

  const target: string = config.getRepoByDir(argv.sourceDir);

  const sync = new Sync();
  return sync.sync({
    $0: '',
    _: [],
    target: target,
    sourceDir: argv.sourceDir,
  });
}

export default command;
