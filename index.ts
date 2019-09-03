import {Arguments, CommandModule} from 'yargs';
import Sync from '@gitsync/sync';
import {Config} from '@gitsync/config';

interface CommitArguments extends Arguments {
  dir: string
}

let command: CommandModule = {
  handler: () => {
  }
};

command.command = 'commit <dir>';

command.describe = 'Sync the commits from the current repository\'s subdirectory to another repository';

command.builder = {
  dir: {
    describe: 'The subdirectory in current repository',
  }
};

command.handler = (argv: CommitArguments) => {
  const config = new Config();
  const target: string = config.getRepoByPath(argv.dir);

  const sync = new Sync();
  return sync.sync({
    $0: '',
    _: [],
    target: target,
    sourcePath: argv.dir,
  });
}

export default command;
