// eslint-disable-next-line @typescript-eslint/no-require-imports
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Define the order of test files
    const order = [
      'auth.e2e-spec.ts',
      'jobs.e2e-spec.ts',
      'applications.e2e-spec.ts',
      'bookmarks.e2e-spec.ts',
    ];

    return tests.sort((testA, testB) => {
      const indexA = order.findIndex((filename) =>
        testA.path.includes(filename),
      );
      const indexB = order.findIndex((filename) =>
        testB.path.includes(filename),
      );

      if (indexA === -1 && indexB === -1) return 0; // both files not in order list
      if (indexA === -1) return 1; // a not in list, b in list
      if (indexB === -1) return -1; // a in list, b not in list
      return indexA - indexB;
    });
  }
}

module.exports = CustomSequencer;
