@{%
  const filteredLines = {null: true, 'COMMENT': true}

  const extractWhitespace = () => null
  const extractComment = () => 'COMMENT'

  function formatMain([{ preProgram, program, postProgram }]) {
    return {
      preProgram,
      program
    }
  }
  function extractMain([preProgram, program, postProgram]) {
    // Why is this being ran multiple times?
    return {
      preProgram,
      program,
      postProgram
    }
  }

  function extractPreProgram([preProgram]) {
    return preProgram
      .map(id)
      .filter(line => !filteredLines[line])
  }
  function extractPostProgram(args) {
    return []
  }

  function extractProgramDotFlow([ formattedProgram, ws, [ dotFn ], commands ]) {
    const operator = dotFn.slice(1)
    if (Array.isArray(formattedProgram)) {
      return [...formattedProgram, { operator, commands }]
    } else {
      return [formattedProgram, { operator, commands }]
    }
  }
  function extractProgramExpressionFlow([formattedProgram, ws, [ dotFn ], expression ]) {
    const operator = dotFn.slice(1)
    return [...formattedProgram, { operator, expression }]
    if (Array.isArray(formattedProgram)) {
      return [...formattedProgram, { operator, expression }]
    } else {
      return [formattedProgram, { operator, expression }]
    }
  }
  function extractProgramFlow([ commands ]) {
    return [{
      operator: 'init',
      commands
    }]
  }
  function extractProgramBranch([formattedProgram, ws, command, programs]) {
    return [...formattedProgram, { operator: 'branch', programs }]
  }

  function extractProgramList(args) {
    const program = args.slice(1, -1)
    return program
  }

  function extractProgramListRecurse(args) {
    const [head, comma, ws, program] = args
    return [...head, program]
  }

  function extractFlow(args) {
    const commands = args[1] || [] // an empty init block will be null
    return (commands || [])
      .filter(item => !filteredLines[item])
  }
  function extractExpressionBlock([paren, expr]) {
    return expr
  }
  function extractFlowSteps([ head, ...tail ]) {
    return [...head, ...tail]
      .filter(item => !filteredLines[item])
  }
  function extractFlowStep([command]) {
    return command
  }
  function extractJsonCommand(args) {
    // TODO
    return args
  }
  function extractInlineCommand([command, ws, arg, kwargs]) {
    return { command, arg, kwargs }
  }
  function extractKwargs([args]) {
    const kwargs = {}
    for (const [ws, keyValuePair] of args) {
      Object.assign(kwargs, keyValuePair)
    }
    return kwargs
  }
  function extractKwarg([key, eq, [value]]) {
    return { [key]: value }
  }

  function extractQuoted([_quote, [inQuotes]]) {
    return inQuotes
  }

  function extractBooleanLogicTree([leftExpr, _1, [operator], _2, rightExpr]) {
      return `${leftExpr} ${operator} ${rightExpr}`
  }
  function extractBooleanLogicTreeNested([leftExpr, _1, [operator], _2, _3, _4, rightExpr]) {
    return `${leftExpr} ${operator} (${rightExpr})`
  }
  function extractBooleanExpr([leftExpr, _1, operator, _2, rightExpr]) {
    return `${leftExpr} ${operator} ${rightExpr}`
  }

  // PRIMITIVES
  function extractStringTemplate([string]) {
    return string.join('')
  }
  // we will throw an error if names like "value" or "index" are used later
  const invalidSlugs = ['true', 'false']
  function extractSlug([slug], l, reject) {
    if (invalidSlugs.includes(slug.join(''))) return reject
    else return slug.join('')
  }
  const extractNumber = ([minus, text]) => {
    if (minus) {
      return -parseInt(text.join(''))
    } else {
      return parseInt(text.join(''))
    }
  }
  function extractText([text]) {
    return text.join('')
  }
%}

# this grammar dont give a toot about json keys matching keyword arguments right now.
# Leave that to the next stage of parsing.
# Maybe in the future we can get more comprehensive macros (https://github.com/kach/nearley/issues/493)

# MACROS
InQuotes[X]               -> "'" $X "'"                                               {% extractQuoted %}
KeywordArg[Key, Value]    -> _ $Key "=" $Value                                        {% d=> d.slice(1) %}
jsonKeyVal[Key, Value]    -> "\"" $Key "\"" ws ":" ws $Value
jsonCommand[Command]      -> "{" ws jsonKeyVal["command", $Command] ws "," ws jsonKeyVal["params", object] ws "}"


# MAIN
FormattedMain             -> Main                                                     {% formatMain %}
Main                      -> PreProgram Program PostProgram                           {% extractMain %}

PreProgram                -> (Comment | Command | nl_):*                                {% extractPreProgram %}

PostProgram               -> (Comment | nl_):*                                        {% extractPostProgram %}

Program                   -> Flow                                                           {% extractProgramFlow %}
                           | Program "\n":? (".map" | ".reduce" | ".loop" | ".catch") Flow  {% extractProgramDotFlow %}
                           | Program "\n":? (".until") ExpressionBlock                      {% extractProgramExpressionFlow %}
                           | Program "\n":? ".branch(" ProgramList ")"                      {% extractProgramBranch %}

ProgramList               -> ws Program ws                                            {% extractProgramList %}
                           | ProgramList "," ws Program ws                            {% extractProgramListRecurse %}


# Various flows
Flow                      -> "(" FlowSteps:? ws ")"                                   {% extractFlow %}
ExpressionBlock           -> "(" LogicTree ")"                                        {% extractExpressionBlock %}
FlowSteps                 -> ws FlowStep
                           | FlowSteps ws FlowStep                                    {% extractFlowSteps %}
FlowStep                  -> JsonCommand                                              {% extractFlowStep %}
                           | Command                                                  {% extractFlowStep %}
                           | Comment                                                  {% extractFlowStep %}
# FlowStep                  -> Request                                                  {% extractFlowStep %}
#                            | Parse                                                    {% extractFlowStep %}
#                            | Comment                                                  {% extractFlowStep %}
#                            | Tag                                                      {% extractFlowStep %}


# COMMANDS
JsonCommand               -> "{" ws jsonKeyVal["command", KeywordSlug] ws "," ws jsonKeyVal["params", object] ws "}"
Command                   -> KeywordSlug _ StringTemplate KeywordArgs                 {% extractInlineCommand %}
KeywordArgs               -> (_ KeywordArg):*                                         {% extractKwargs %}
KeywordArg                -> KeywordSlug "=" (StringTemplate | Boolean | Number)      {% extractKwarg %}
KeywordSlug               -> [A-Z]:+                                                  {% extractSlug %}

Input                     -> "INPUT" _ InQuotes[Slug]                                 {% extractInlineCommand %}

# PRIMITIVES
LogicTree                 -> BooleanExpr                                              {% id %}
                           | LogicTree _ LogicOperator _ BooleanExpr                  {% extractBooleanLogicTree %}
                           | LogicTree _ LogicOperator _ "(" _star LogicTree _star ")"{% extractBooleanLogicTreeNested %}
BooleanExpr               -> Any _ ComparisonOperator _ Any                           {% extractBooleanExpr %}
ComparisonOperator        -> "==" | ">" | ">=" | "<" | "<="
LogicOperator             -> "||" | "&&"

StringTemplate            -> InQuotes[[^'\n\r]:*]                                     {% extractText %}
Slug                      -> [a-zA-Z0-9-]:+                                           {% extractSlug %}
Number                    -> "-":? [0-9]:+                                                  {% extractNumber %}
Boolean                   -> "true"                                                   {% d => true %}
                           | "false"                                                  {% d => false %}
Any                       -> StringTemplate | Number                                  {% id %}


# COMMENTS
Comment                   -> "#" [^\n\r]:* nl                                         {% extractComment %}


# Whitespace. The important thing here is that the postprocessor
# is a null-returning function. This is a memory efficiency trick.
ws                        -> [\s]:*                                                   {% extractWhitespace %}
_s                        -> [\s]:+                                                   {% extractWhitespace %}
_                         -> " ":+                                                    {% extractWhitespace %}
_star                     -> " ":*                                                    {% extractWhitespace %}
# __                        -> " ":*
nl                        -> [\r\n]                                                   {% extractWhitespace %}
# nl?                       -> [\r\n]:?
nl_                       -> [\r\n] " ":*                                             {% extractWhitespace %}


# COMMANDS JSON
# TODO use javascript templated literals to create a macro to combine this and the command string
object -> "{" ws "}" {% function(d) { return {}; } %}
    | "{" ws pair (ws "," ws pair):* ws "}" {% extractObject %}
array -> "[" ws "]" {% function(d) { return []; } %}
    | "[" ws value (ws "," ws value):* ws "]" {% extractArray %}
pair -> key ws ":" ws value {% function(d) { return [d[0], d[4]]; } %}
key -> string {% id %}
value ->
      object {% id %}
    | array {% id %}
    | number {% id %}
    | string {% id %}
    | "true" {% function(d) { return true; } %}
    | "false" {% function(d) { return false; } %}
    | "null" {% function(d) { return null; } %}

space -> [\s]:+
number -> "-":? [0-9]:+
string -> "\"" [^\"\n\r]:* "\"" # /"(?:\\["bfnrt\/\\]|\\u[a-fA-F0-9]{4}|[^"\\])*"/,

@{%
function extractObject(d) {
    let output = {};

    extractPair(d[2], output);

    for (let i in d[3]) {
        extractPair(d[3][i][3], output);
    }

    return output;
}
function extractPair(kv, output) {
    if(kv[0]) { output[kv[0]] = kv[1]; }
}

function extractArray(d) {
    let output = [d[2]];

    for (let i in d[3]) {
        output.push(d[3][i][3]);
    }

    return output;
}
%}
