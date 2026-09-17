program ByteCodeVerifierTest;
// Checks that POCAVerifyCode accepts what the compiler produces and rejects
// bytecode that has been broken in the ways a damaged or forged file could be.
//
// Build from the src directory, for example:
//  fpc -Mdelphi -Fu../externals/flre/src -Fu../externals/pasjson/src
//      -Fu../externals/pucu/src -Fu../externals/pasmp/src
//      -Fu../externals/pasdblstrutils/src ../tests/ByteCodeVerifierTest.dpr
{$ifdef fpc}
 {$mode delphi}
{$endif}
{$apptype console}

uses
{$ifdef fpc}
{$ifdef unix}
  cmem,
  cthreads,
{$endif}
{$endif}
  SysUtils,
  PasMP,
  PUCU,
  PasDblStrUtils,
  PasJSON,
  FLRE,
  POCA;

var Instance:PPOCAInstance;
    Context:PPOCAContext;
    Failures:TPOCAInt32;

function Compile(const aSource:TPOCARawByteString):TPOCAValue;
begin
 result:=POCACompile(Instance,Context,aSource,'test');
 POCAProtect(Context,result);
end;

function CodeOf(const aValue:TPOCAValue):PPOCACode;
begin
 result:=PPOCACode(POCAGetValueReferencePointer(aValue));
end;

function FirstChild(const aCode:PPOCACode):PPOCACode;
var Index:TPOCAInt32;
begin
 for Index:=0 to TPOCAInt32(aCode^.ConstantCount)-1 do begin
  if POCAIsValueCode(aCode^.Constants^[Index]) then begin
   result:=CodeOf(aCode^.Constants^[Index]);
   exit;
  end;
 end;
 result:=nil;
end;

function FindConstant(const aCode:PPOCACode;const aValueType:TPOCAInt32):TPOCAInt32;
var Index:TPOCAInt32;
begin
 for Index:=0 to TPOCAInt32(aCode^.ConstantCount)-1 do begin
  if POCAGetValueType(aCode^.Constants^[Index])=aValueType then begin
   result:=Index;
   exit;
  end;
 end;
 result:=-1;
end;

// Position of the first instruction with the opcode, or -1
function FindInstruction(const aCode:PPOCACode;const aOpcode:TPOCAUInt32):TPOCAInt32;
var Position:TPOCAInt32;
begin
 Position:=0;
 while Position<TPOCAInt32(aCode^.ByteCodeSize) do begin
  if (aCode^.ByteCode^[Position] and $ff)=aOpcode then begin
   result:=Position;
   exit;
  end;
  inc(Position,1+TPOCAInt32(aCode^.ByteCode^[Position] shr 8));
 end;
 result:=-1;
end;

// Position of the last instruction
function FindLastInstruction(const aCode:PPOCACode):TPOCAInt32;
var Position:TPOCAInt32;
begin
 result:=-1;
 Position:=0;
 while Position<TPOCAInt32(aCode^.ByteCodeSize) do begin
  result:=Position;
  inc(Position,1+TPOCAInt32(aCode^.ByteCode^[Position] shr 8));
 end;
end;

// Position of the first operand of the given kind, or -1
function FindOperand(const aCode:PPOCACode;const aKind:TPOCAOperandKind):TPOCAInt32;
var Position,Index:TPOCAInt32;
    Info:PPOCAOpcodeInfo;
begin
 Position:=0;
 while Position<TPOCAInt32(aCode^.ByteCodeSize) do begin
  Info:=@POCAOpcodeInfos[aCode^.ByteCode^[Position] and $ff];
  for Index:=0 to (Info^.CountOperands+Info^.CountOptionalOperands)-1 do begin
   if (Index<TPOCAInt32(aCode^.ByteCode^[Position] shr 8)) and (Info^.Kinds[Index]=aKind) then begin
    result:=Position+1+Index;
    exit;
   end;
  end;
  inc(Position,1+TPOCAInt32(aCode^.ByteCode^[Position] shr 8));
 end;
 result:=-1;
end;

procedure Check(const aName:string;const aRoot:TPOCAValue;const aExpected:boolean);
var Error:TPOCARawByteString;
begin
 if POCAVerifyCode(aRoot,Error)=aExpected then begin
  writeln('pass  ',aName);
  if length(Error)>0 then begin
   writeln('        ',Error);
  end;
 end else begin
  writeln('FAIL  ',aName,' ',Error);
  inc(Failures);
 end;
end;

// Overwrites one word of the bytecode, checks, and puts the word back
procedure CheckPatched(const aName:string;const aRoot:TPOCAValue;const aCode:PPOCACode;const aPosition:TPOCAInt32;const aValue:TPOCAUInt32;const aExpected:boolean=false);
var Saved:TPOCAUInt32;
begin
 if (not assigned(aCode)) or (aPosition<0) then begin
  writeln('FAIL  ',aName,' (nothing to patch found)');
  inc(Failures);
  exit;
 end;
 Saved:=aCode^.ByteCode^[aPosition];
 aCode^.ByteCode^[aPosition]:=aValue;
 try
  Check(aName,aRoot,aExpected);
 finally
  aCode^.ByteCode^[aPosition]:=Saved;
 end;
end;

procedure TestPlain;
var Root:TPOCAValue;
    Code,Child:PPOCACode;
    Position:TPOCAInt32;
begin
 Root:=Compile('function f(a, b) { let x = a + b; if (x > 1) { x = 0; } return x; }'+#10+
               'var r = f(1, 2);'+#10+
               'var q = Math.sqrt(r);'+#10);
 Code:=CodeOf(Root);
 Child:=FirstChild(Code);
 Check('plain code is accepted',Root,true);

 Position:=FindInstruction(Child,popRETURN);
 CheckPatched('unknown opcode',Root,Child,Position,161 or (1 shl 8));
 CheckPatched('too few operands',Root,Child,Position,popRETURN);
 CheckPatched('too many operands',Root,Child,Position,popRETURN or (2 shl 8));
 CheckPatched('instruction cut off by the end',Root,Child,Position,popFCALL or ($ffff shl 8));
 CheckPatched('register out of range',Root,Child,Position+1,Child^.CountRegisters);

 // The last instruction of f can not be reached after its own return, but the
 // one of the outermost code object can
 Position:=FindLastInstruction(Child);
 CheckPatched('unreachable code may end without a return',Root,Child,Position,popLOADNULL or (1 shl 8),true);
 Position:=FindLastInstruction(Code);
 CheckPatched('execution runs past the end',Root,Code,Position,popLOADNULL or (1 shl 8));

 Position:=FindInstruction(Code,popLOADCODE);
 CheckPatched('code constant out of range',Root,Code,Position+2,Code^.ConstantCount);
 CheckPatched('code constant of the wrong type',Root,Code,Position+2,FindConstant(Code,pvtSTRING));
 CheckPatched('function made of a code constant loaded as it is',Root,Code,Position,popLOADCONST or (2 shl 8));

 Position:=FindOperand(Child,pokJUMP);
 CheckPatched('jump into the middle of an instruction',Root,Child,Position,Position);
 CheckPatched('jump past the end',Root,Child,Position,Child^.ByteCodeSize);

 Position:=FindOperand(Code,pokINLINECACHE);
 CheckPatched('inline cache slot out of range',Root,Code,Position,Code^.CountInlineCaches);

 Position:=FindOperand(Code,pokHASHCACHE);
 CheckPatched('any hash cache slot content is fine',Root,Code,Position,$12345678,true);

 Position:=FindOperand(Code,pokINTRINSIC);
 CheckPatched('unknown intrinsic',Root,Code,Position,piidCOUNT);

 begin
  Child^.RestArgSym:=Child^.ConstantCount;
  Check('rest arguments symbol out of range',Root,false);
  Child^.RestArgSym:=FindConstant(Child,pvtSTRING);
 end;

 begin
  Child^.ArgumentLocals^[0].Kind:=TPOCACodeArgument.pcakREG;
  Child^.ArgumentLocals^[0].Index:=Child^.CountRegisters;
  Check('argument register out of range',Root,false);
 end;

 POCAUnprotect(Context,Root);
end;

procedure TestClosures;
var Root:TPOCAValue;
    Code,Child:PPOCACode;
    Position:TPOCAInt32;
begin
 Root:=Compile('#pragma loopclosures on'+#10+
               'var fns = [];'+#10+
               'for (let i = 0; i < 3; i++) {'+#10+
               ' fns.push(() => i);'+#10+
               '}'+#10);
 Code:=CodeOf(Root);
 Child:=FirstChild(Code);
 Check('closures in a loop are accepted',Root,true);

 Position:=FindInstruction(Code,popPUSHLOCALVALUELEVEL);
 CheckPatched('closing a level that was never opened',Root,Code,Position,popNOP);

 Position:=FindInstruction(Child,popGETOUTERVALUE);
 CheckPatched('level of frame values not available',Root,Child,Position+2,Child^.Level);
 CheckPatched('frame value out of range',Root,Child,Position+3,$7fffffff);

 begin
  inc(Child^.Level);
  Check('code object deeper than the levels it is given',Root,false);
  dec(Child^.Level);
 end;

 begin
  Code^.UseFrameValues:=false;
  Check('frame values used without being set up',Root,false);
  Code^.UseFrameValues:=true;
 end;

 Check('closures in a loop are still accepted',Root,true);

 POCAUnprotect(Context,Root);
end;

procedure TestLabeledBreak;
var Root:TPOCAValue;
begin
 // Leaves the inner level open on the way out, which the verifier has to live
 // with, since the fewest open levels are what counts.
 Root:=Compile('#pragma loopclosures on'+#10+
               'var fns = [];'+#10+
               'outer: for (let i = 0; i < 3; i++) {'+#10+
               ' for (let j = 0; j < 3; j++) {'+#10+
               '  fns.push(() => i + j);'+#10+
               '  if (j == 1) { break outer; }'+#10+
               ' }'+#10+
               ' fns.push(() => i);'+#10+
               '}'+#10);
 Check('labeled break out of nested closure loops is accepted',Root,true);
 POCAUnprotect(Context,Root);
end;

begin
 Failures:=0;
 Instance:=POCAInstanceCreate;
 try
  Context:=POCAContextCreate(Instance);
  try
   writeln('Bytecode ABI version ',POCAByteCodeABIVersion,', fingerprint $',IntToHex(POCAByteCodeABIFingerprint,8));
   TestPlain;
   TestClosures;
   TestLabeledBreak;
  finally
   POCAContextDestroy(Context);
  end;
 finally
  POCAInstanceDestroy(Instance);
 end;
 if Failures>0 then begin
  writeln(Failures,' check(s) failed');
  halt(1);
 end else begin
  writeln('All checks passed');
 end;
end.
