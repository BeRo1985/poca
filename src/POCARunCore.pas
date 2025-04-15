unit pocaruncore;
{$ifdef fpc}
 {$mode delphi}
{$endif}
{$ifdef win32}
 {$apptype console}
 {$define Windows}
{$endif}
{$ifdef win64}
 {$apptype console}
 {$define Windows}
{$endif}

interface

uses {$ifdef Windows}Windows,{$endif}SysUtils,Classes,POCA;

procedure MainProc;

implementation

const REPLCode='print("Welcome to POCA version '+POCAVersion+'.\n");'#13#10+
               'print("Type \".help\" for more information. To exit, press Ctrl+C, Ctrl+D or type \".exit\".\n");'#13#10+
               'let expr = "", lineRegExp = /^(.*)\\s*$/, cmdRegEx = /^\s*\.(\w+)\s*(.*)/, currentScope = {};'#13#10+
               'while(1){'#13#10+
               '  let match, line = readLine((expr == "") ? "> " : ". ");'#13#10+
               '  if(line === null){'#13#10+
               '    break;'#13#10+
               '  }'#13#10+
               '  if(match = lineRegExp.match(line)){'#13#10+
               '    expr ~= match[0][1] ~ "\n";'#13#10+
               '    continue;'#13#10+
               '  }'#13#10+
               '  expr ~= line;'#13#10+
               '  if(expr == "exit"){'#13#10+
               '    break;'#13#10+
               '  }else if(match = cmdRegEx.match(expr)){'#13#10+
               '    let cmd = match[0][1];'#13#10+
               '    when(cmd){'#13#10+
               '      case("exit"){'#13#10+
               '        break;'#13#10+
               '      }'#13#10+
               '      case("help"){'#13#10+
               '        print(".exit     Exit the REPL\n");'#13#10+
               '        print(".help     Print this help message\n");'#13#10+
               '      }'#13#10+
               '      else{'#13#10+
               '        print("Invalid REPL keyword \"." ~ cmd ~ "\"\n");'#13#10+
               '      }'#13#10+
               '    }'#13#10+
               '  }else{'#13#10+
               '    try{'#13#10+
               '      print("< " ~ String.dump(eval(expr, "<eval>", [], null, currentScope)) ~ "\n");'#13#10+
               '    }catch(let err){'#13#10+
               '      for(let i = err.size() - 1; i >= 0; i--){'#13#10+
               '        print(err[i] ~ " ");'#13#10+
               '      }'#13#10+
               '      print("\n");'#13#10+
               '    }'#13#10+
               '  }'#13#10+
               '  expr = "";'#13#10+
               '}'#13#10;

type TRandomNumberGenerator=class(TPOCANativeObject)
      public
       constructor Create(const pInstance:PPOCAInstance;const pContext:PPOCAContext;const pPrototype,pConstructor:PPOCAValue;const pExpandable:boolean); override;
       destructor Destroy; override;
      published
       function create_(const Context:PPOCAContext;const This:TPOCAValue;const Arguments:PPOCAValues;const CountArguments:longint):TPOCAValue;
     end;

     TRandomNumberGeneratorInstance=class(TPOCANativeObject)
      private
       function GetRandomNumber:double;
      public
       constructor Create(const pInstance:PPOCAInstance;const pContext:PPOCAContext;const pPrototype,pConstructor:PPOCAValue;const pExpandable:boolean); override;
       destructor Destroy; override;
      published
       function get(const Context:PPOCAContext;const This:TPOCAValue;const Arguments:PPOCAValues;const CountArguments:longint):TPOCAValue;
       property randomnumber:double read GetRandomNumber;
     end;

constructor TRandomNumberGenerator.Create(const pInstance:PPOCAInstance;const pContext:PPOCAContext;const pPrototype,pConstructor:PPOCAValue;const pExpandable:boolean);
begin
 inherited Create(pInstance,pContext,pPrototype,pConstructor,pExpandable);
end;

destructor TRandomNumberGenerator.Destroy;
begin
 inherited Destroy;
end;

function TRandomNumberGenerator.create_(const Context:PPOCAContext;const This:TPOCAValue;const Arguments:PPOCAValues;const CountArguments:longint):TPOCAValue;
begin
 result:=POCANewNativeObject(Context,TRandomNumberGeneratorInstance.Create(Instance,Context,nil,@GhostValue,false));
end;

constructor TRandomNumberGeneratorInstance.Create(const pInstance:PPOCAInstance;const pContext:PPOCAContext;const pPrototype,pConstructor:PPOCAValue;const pExpandable:boolean);
begin
 inherited Create(pInstance,pContext,pPrototype,pConstructor,pExpandable);
end;

destructor TRandomNumberGeneratorInstance.Destroy;
begin
 inherited Destroy;
end;

function TRandomNumberGeneratorInstance.GetRandomNumber:double;
begin
 result:=random;
end;

function TRandomNumberGeneratorInstance.get(const Context:PPOCAContext;const This:TPOCAValue;const Arguments:PPOCAValues;const CountArguments:longint):TPOCAValue;
begin
 result.Num:=GetRandomNumber;
end;

procedure UTF8WriteLn(const s:TPOCAUTF8String);
{$ifdef Windows}
var NumWritten:Cardinal;
begin
 WriteConsoleA(GetStdHandle(STD_OUTPUT_HANDLE),PAnsiChar(s),length(s),NumWritten,nil);
 WriteLn;
end;
{$else}
begin
 WriteLn(s);
end;
{$endif}

procedure MainProc2;
var Instance:PPOCAInstance;
    Context:PPOCAContext;
    Hash:TPOCAValue;
    Index:TPOCAPtrInt;
begin
 Instance:=POCAInstanceCreate;
 try
  Context:=POCAContextCreate(Instance);
  try
   Hash:=POCANewHash(Context);
   POCAHashSet(Context,Instance.Globals.Namespace,POCANewUniqueString(Context,'TestHash'),Hash);
   for Index:=0 to 16777216 do begin
    POCAHashSetString(Context,Hash,IntToStr(Index),POCANewNumber(Context,Index));
   end;
   POCAHashSetString(Context,Hash,IntToStr(-1),POCANewNumber(Context,-1));
  finally
   POCAContextDestroy(Context);
  end;
 finally
  POCAInstanceDestroy(Instance);
 end;
end;

procedure MainProc;
{$ifdef Windows}
//const CP_UTF16=1200;
{$endif}
var Instance:PPOCAInstance;
    Context:PPOCAContext;
    Code:TPOCAValue;
    FileName:string;
    Arguments:array of TPOCAValue;
    i:longint;
begin
{$ifdef Windows}
{SetTextCodePage(Input,CP_UTF8);
 SetTextCodePage(Output,CP_UTF8);
 SetConsoleCP(CP_UTF8);{}
 SetTextCodePage(Output,CP_UTF8);
 SetConsoleOutputCP(CP_UTF8);
{$endif}
 Randomize;
 Arguments:=nil;
 if FindCmdLineSwitch('/h',true) then begin
  writeln('Usage: '+ExtractFileName(ParamStr(0))+' file.poca [parameters...]');
 end else begin
  Instance:=POCAInstanceCreate;
  try
   Context:=POCAContextCreate(Instance);
   try
    POCAHashSet(Context,Instance.Globals.Namespace,POCANewUniqueString(Context,'RandomNumberGenerator'),POCANewNativeObject(Context,TRandomNumberGenerator.Create(Instance,Context,nil,nil,false)));
    if ParamCount>0 then begin
     FileName:=ParamStr(1);
     if ParamCount>1 then begin
      SetLength(Arguments,ParamCount-1);
      for i:=2 to ParamCount do begin
       Arguments[i-2]:=POCANewString(Context,TPOCAUTF8String(ParamStr(i)));
      end;
     end;
     Code:=POCACompile(Instance,Context,POCAGetFileContent(TPOCAUTF8String(FileName)),TPOCAUTF8String(FileName));
    end else begin
     Code:=POCACompile(Instance,Context,REPLCode,'<REPL>');
    end;
    POCACall(Context,Code,@Arguments[0],length(Arguments),POCAValueNull,Instance^.Globals.Namespace);
   except
    on e:EPOCASyntaxError do begin
     writeln('SyntaxError["',Instance^.SourceFiles[e.SourceFile],'":',e.SourceLine,',',e.SourceColumn,']: ',e.Message);
     readln;
    end;
    on e:EPOCARuntimeError do begin
     writeln('RuntimeError["',Instance^.SourceFiles[e.SourceFile],'":',e.SourceLine,']: ',e.Message);
     readln;
    end;
    on e:EPOCAScriptError do begin
     writeln('ScriptError["',Instance^.SourceFiles[e.SourceFile],'":',e.SourceLine,']: ',e.Message);
     readln;
    end;
    on e:Exception do begin
     raise;
    end;
   end;
  finally
   SetLength(Arguments,0);
   POCAInstanceDestroy(Instance);
  end;
 end;
end;

end.
