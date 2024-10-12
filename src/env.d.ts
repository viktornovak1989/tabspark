/// <reference path="../.astro/types.d.ts" />

declare module '@trevoreyre/autocomplete-js';

declare global {
  var statsStorage: Record<string, number>;
  var totalSubmissions: number;
}
