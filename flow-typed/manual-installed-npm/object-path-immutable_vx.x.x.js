declare module 'object-path-immutable' {
  declare function set<O>(obj: O, path: (string | (number | string)[]), value: any): O;
}
