type RegexReplace = {
  select: string,
  replace: string,
};

type ExpectedResults = 'html' | 'json' | 'scalar';

type Scrape = {
  selector: string, // html selector (e.g. '.someclass > span')
  attribute?: string, // html element attribute (e.g. src)
  regex_cleanup?: RegexReplace,
  expect?: ExpectedResults,
};

type UrlCriteria = Scrape;

type ScrapeCriteria = {
  criteria: Scrape,
  for_each?: ScrapeCriteria,
};

type NextUrl =
  | {
      type: 'increment',
      build_url: string,
      increment_by?: number, // defaults to 1
      inital_value?: number, // defaults to 0
      regex_cleanup?: RegexReplace,
      expect?: ExpectedResults, // defaults to "html
    }
  | {
      type: 'pagination',
      url_criteria: UrlCriteria, // should return single value
      regex_cleanup?: RegexReplace,
      expect?: ExpectedResults
    };

type Config = {
  input: string | [string],
  next_url: NextUrl,
  scrape_criteria: ScrapeCriteria,
};

const configDeviantart: Config = {
  input: ['artist'],
  next_url: {
    type: 'increment',
    build_url:
      'https://{artist}.deviantart.com/gallery/?catpath=/&offset={_page}',
    increment_by: 24,
  },
  scrape_criteria: {
    criteria: {
      selector: '.torpedo-thumb-link',
      attribute: 'href',
    },
    for_each: {
      criteria: {
        selector: '.dev-view-deviation',
        attribute: 'src',
      },
    },
  },
};
const configTumblr: Config = {
  input: 'username',
  next_url: {
    type: 'increment',
    build_url:
      'https://{artist}.deviantart.com/gallery/?catpath=/&offset={_page}',
    increment_by: 50,
    regex_cleanup: {
      select: 'var tumblr_api_read = ',
      replace: '',
    },
    expect: 'json',
  },
  scrape_criteria: {
    criteria: {
      selector: 'posts[type:photo].photo-url-1280',
      regex_cleanup: {
        select: 'https://d+?.',
        replace: 'https://',
      },
    },
  },
};
