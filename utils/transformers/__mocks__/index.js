export const dashToCamelCaseItems = [
  {
    from: 'this-is-a-dash-case-example',
    to: 'thisIsADashCaseExample',
  },
  {
    from: '-is-a-dash-case-example',
    to: 'isADashCaseExample',
  },
  {
    from: 'this-is-a-dAsh-Case-EXAMPlE',
    to: 'thisIsADAshCaseEXAMPlE',
  },
  {
    from: 'thisIsADashCaseExample',
    to: 'thisIsADashCaseExample',
  },
  {
    from: 'camel-case',
    to: 'camelCase',
  },
  {
    from: 'this---is--weird',
    to: 'thisIsWeird',
  },
  {
    from: 'this-',
    to: 'this',
  },
  {
    from: '--',
    to: '',
  },
];
