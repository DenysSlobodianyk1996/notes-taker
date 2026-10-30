import en from '../../../../public/i18n/en.json';
import uk from '../../../../public/i18n/uk.json';
import { DEFAULT_FOLDER_NAMES } from './default-folder-names';

describe('DEFAULT_FOLDER_NAMES', () => {
  it("matches the Default folder's name in every translation file", () => {
    expect(DEFAULT_FOLDER_NAMES).toEqual([en.folders.defaultName, uk.folders.defaultName]);
  });
});
