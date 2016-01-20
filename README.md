# zr-podcast

[![NPM Version](http://img.shields.io/npm/v/zr-podcast.svg)](https://www.npmjs.org/package/zr-podcast)

[Žinių radijas](http://www.ziniuradijas.lt) podcast generator

```bash
$ zr-podcast -h

Usage: zr-podcast [url]

Scrape Žinių radijas website and generate podcast file.

Options:
  -d, --daemon        start as HTTP server. Accepts [url] as request path.
                      Configuration envrionment variables:
                        HOST - host to listen on
                        PORT - port to listen on

  -v, --version       print version number
  -h, --help          print usage information

Supported URL formats:
  archive pages, e.g. http://www.ziniuradijas.lt/archyvas/laidu-irasai
  show pages, e.g. http://www.ziniuradijas.lt/laida/atviras-pokalbis/192
```

## License
ISC
