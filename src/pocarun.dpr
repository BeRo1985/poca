program pocarun;
{$ifdef fpc}
 {$mode delphi}
{$endif}
{$ifdef win32}
 {$apptype console}
{$endif}
{$ifdef win64}
 {$apptype console}
{$endif}

uses
{$ifdef fpc}
{$ifdef unix}
  cmem,
  cthreads,
{$endif}
{$endif}
  FLRE in 'FLRE.pas',
  POCA in 'POCA.pas',
  PUCU in 'PUCU.pas',
  POCARunCore in 'POCARunCore.pas',
  PasMP in 'PasMP.pas';

begin
 MainProc;
end.
