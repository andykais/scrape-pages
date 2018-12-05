'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var lib_1 = require('ts-runtime/lib')
var Input = lib_1.default.type(
  'Input',
  lib_1.default.object(
    lib_1.default.indexer(
      'inputName',
      lib_1.default.nullable(lib_1.default.string()),
      lib_1.default.nullable(
        lib_1.default.union(
          lib_1.default.nullable(lib_1.default.number()),
          lib_1.default.nullable(lib_1.default.string()),
          lib_1.default.nullable(lib_1.default.boolean())
        )
      )
    )
  )
)
var OptionsAny = lib_1.default.type(
  'OptionsAny',
  lib_1.default.object(
    lib_1.default.property(
      'cache',
      lib_1.default.nullable(lib_1.default.boolean()),
      true
    )
  )
)
var ScraperOptions = lib_1.default.type(
  'ScraperOptions',
  lib_1.default.intersect(lib_1.default.ref(OptionsAny), lib_1.default.object())
)
exports.Parallelism = lib_1.default.type(
  'Parallelism',
  lib_1.default.object(
    lib_1.default.property(
      'maxConcurrent',
      lib_1.default.nullable(lib_1.default.number()),
      true
    ),
    lib_1.default.property(
      'rateLimit',
      lib_1.default.object(
        lib_1.default.property(
          'rate',
          lib_1.default.nullable(lib_1.default.number())
        ),
        lib_1.default.property(
          'limit',
          lib_1.default.nullable(lib_1.default.number())
        )
      ),
      true
    )
  )
)
exports.RunOptionsInit = lib_1.default.type(
  'RunOptionsInit',
  lib_1.default.intersect(
    lib_1.default.ref(OptionsAny),
    lib_1.default.ref(exports.Parallelism),
    lib_1.default.object(
      lib_1.default.property(
        'input',
        lib_1.default.nullable(lib_1.default.ref(Input)),
        true
      ),
      lib_1.default.property(
        'folder',
        lib_1.default.nullable(lib_1.default.string())
      ),
      lib_1.default.property(
        'optionsEach',
        lib_1.default.object(
          lib_1.default.indexer(
            'name',
            lib_1.default.nullable(lib_1.default.string()),
            lib_1.default.nullable(lib_1.default.ref(ScraperOptions))
          )
        ),
        true
      )
    )
  )
)
exports.RunOptions = lib_1.default.type(
  'RunOptions',
  lib_1.default.intersect(
    lib_1.default.ref(OptionsAny),
    lib_1.default.ref(exports.Parallelism),
    lib_1.default.ref(ScraperOptions),
    lib_1.default.object(
      lib_1.default.property(
        'input',
        lib_1.default.nullable(lib_1.default.ref(Input))
      ),
      lib_1.default.property(
        'folder',
        lib_1.default.nullable(lib_1.default.string())
      )
    )
  )
)
exports.FlatRunOptions = lib_1.default.type(
  'FlatRunOptions',
  lib_1.default.object(
    lib_1.default.indexer(
      'name',
      lib_1.default.nullable(lib_1.default.string()),
      lib_1.default.nullable(lib_1.default.ref(exports.RunOptions))
    )
  )
)
