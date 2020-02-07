# this grammar dont give a toot about json keys matching keyword arguments right now.
# Leave that to the next stage of parsing.
# Maybe in the future we can get more comprehensive macros (https://github.com/kach/nearley/issues/493)

# MACROS
inQuotes[X]     -> "'" $X "'" {% quoted => quoted[1][0].join('') %}
KeywordArg[Key, Value] -> _ $Key "=" $Value
jsonKeyVal[Key, Value]   -> "\"" Key "\"" ws ":" ws Value
jsonCommand[Command]     -> "{" ws jsonKeyVal["command", Command] ws "," ws jsonKeyVal["params", object] ws "}"


# MAIN
Main            -> (Comment | nl_ | Input):* Program (Comment | nl_):*

Program         -> FirstBlock
                 | Program DotBlock

FirstBlock      -> Flow

DotBlock        -> "." ("map" | "reduce" | "loop" | "catch") Flow
                 | ".branch(" FlowList ")"
                 | ".until(" _star BooleanLogic _star ")"

# Various flows
FlowList        -> ws Flow ws
                 | FlowList "," ws Flow ws
Flow            -> "(" FlowSteps:? ws ")"
FlowSteps       -> ws FlowStep
                 | FlowSteps ws FlowStep
FlowStep        -> Request | Parse | Comment | Tag


# COMMANDS
Input           -> "INPUT" _ inQuotes[Slug]

Tag             -> "TAG" _ inQuotes[Slug]

Request         -> HttpVerb _ Url
                    (KeywordArg["READ", Boolean]
                    | KeywordArg["WRITE", Boolean]):* nl
                    | jsonCommand[HttpVerb] nl

HttpVerb        -> "GET" | "POST" | "PUT" | "DELETE"
Url             -> StringTemplate

Parse           -> "PARSE" _ Selector
                    (KeywordArg["ATTR", Attribute]
                    | KeywordArg["MAX", Number]):* nl
                    | jsonCommand["PARSE"] nl
Selector        -> StringTemplate
Attribute       -> StringTemplate

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
string -> "\"" [^\"]:* "\"" # /"(?:\\["bfnrt\/\\]|\\u[a-fA-F0-9]{4}|[^"\\])*"/,

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



# PRIMITIVES
BooleanLogic    -> Any _ "==" _ Any
StringTemplate  -> inQuotes[[^'\n\r]:*]
Slug            -> [a-zA-Z0-9-]:+
Number          -> [0-9]:+
Boolean         -> "true" | "false"
Any             -> StringTemplate | Number | Boolean | Slug


# COMMENTS
Comment         -> "#" [^\n\r]:* nl {% () => "COMMENT" %}


# Whitespace. The important thing here is that the postprocessor
# is a null-returning function. This is a memory efficiency trick.
ws              -> [\s]:* {% () => null %}
_s              -> [\s]:+ {% () => null %}
_               -> " ":+ {% () => null %}
_star               -> " ":* {% () => null %}
nl              -> [\r\n] {% () => 'nl'%}
nl_             -> [\r\n] " ":* {% () => 'nl'%}
