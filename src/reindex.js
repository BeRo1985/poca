#!/usr/bin/env node

const pascalConsts = `
      popNOP=0;
      popADD=1;
      popSUB=2;
      popMUL=3;
      popDIV=4;
      popNEG=5;
      popNOT=6;
      popCAT=7;
      popLT=8;
      popLTEQ=9;
      popGT=10;
      popGTEQ=11;
      popEQ=12;
      popNEQ=13;
      popCMP=14;
      popSEQ=15;
      popSNEQ=16;
      popEACH=17;
      popJMP=18;
      popJMPLOOP=19;
      popJIFTRUE=20;
      popJIFFALSE=21;
      popJIFTRUELOOP=22;
      popJIFFALSELOOP=23;
      popFCALL=24;
      popMCALL=25;
      popRETURN=26;
      popLOADCODE=27;
      popLOADCONST=27;
      popLOADONE=28;
      popLOADZERO=29;
      popLOADINT32=30;
      popLOADNULL=31;
      popLOADTHAT=32;
      popLOADTHIS=33;
      popLOADSELF=34;
      popLOADLOCAL=35;
      popCOPY=36;
      popINSERT=37;
      popEXTRACT=38;
      popGETMEMBER=39;
      popSETMEMBER=40;
      popGETLOCAL=41;
      popSETLOCAL=42;
      popGETUPVALUE=43;
      popSETUPVALUE=44;
      popNEWARRAY=45;
      popARRAYPUSH=46;
      popARRAYRANGEPUSH=47;
      popNEWHASH=48;
      popHASHAPPEND=49;
      popSETSYM=50;
      popINDEX=51;
      popFCALLH=52;
      popMCALLH=53;
      popUNPACK=54;
      popSLICE=55;
      popSLICE2=56;
      popSLICE3=57;
      popTRY=58;
      popTRYBLOCKEND=59;
      popTHROW=60;
      popDEC=61;
      popINC=62;
      popBAND=63;
      popBXOR=64;
      popBOR=65;
      popBNOT=66;
      popBSHL=67;
      popBSHR=68;
      popBUSHR=69;
      popMOD=70;
      popPOW=71;
      popINHERITEDGETMEMBER=72;
      popKEY=73;
      popIN=74;
      popINRANGE=75;
      popFTAILCALL=76;
      popMTAILCALL=77;
      popFTAILCALLH=78;
      popMTAILCALLH=79;
      popINSTANCEOF=80;
      popBREAKPOINT=81;
      popNUM=82;
      popN_NOT=83;
      popN_ADD=84;
      popN_SUB=85;
      popN_MUL=86;
      popN_DIV=87;
      popN_NEG=88;
      popN_LT=89;
      popN_LTEQ=90;
      popN_GT=91;
      popN_GTEQ=92;
      popN_EQ=93;
      popN_NEQ=94;
      popN_CMP=95;
      popN_DEC=96;
      popN_INC=97;
      popN_BAND=98;
      popN_BXOR=99;
      popN_BOR=100;
      popN_BNOT=101;
      popN_BSHL=102;
      popN_BSHR=103;
      popN_BUSHR=104;
      popN_MOD=105;
      popN_POW=106;
      popN_INRANGE=107;
      popN_JIFTRUE=108;
      popN_JIFFALSE=109;
      popN_JIFTRUELOOP=110;
      popN_JIFFALSELOOP=111;
      popN_JIFLT=112;
      popN_JIFLTEQ=113;
      popN_JIFGT=114;
      popN_JIFGTEQ=115;
      popN_JIFEQ=116;
      popN_JIFNEQ=117;
      popN_JIFLTLOOP=118;
      popN_JIFLTEQLOOP=119;
      popN_JIFGTLOOP=120;
      popN_JIFGTEQLOOP=121;
      popN_JIFEQLOOP=122;
      popN_JIFNEQLOOP=123;
      popUPDATESTRING=124;
      popREGEXP=125;
      popREGEXPEQ=126;
      popREGEXPNEQ=127;
      popSQRT=128;
      popN_SQRT=129;
      popGETPROTOTYPE=130;
      popSETPROTOTYPE=131;
      popGETCONSTRUCTOR=132;
      popSETCONSTRUCTOR=133;
      popDELETE=134;
      popDELETEEX=135;
      popDEFINED=136;
      popDEFINEDEX=137;
      popLOADGLOBAL=138;
      popLOADBASECLASS=139;
      popGETHASHKIND=140;
      popSETHASHKIND=141;
      popTYPEOF=142;
      popIDOF=143;
      popGHOSTTYPEOF=144;
      popELVIS=145;
      popIS=146;
      popJIFNULL=147;
      popJIFNOTNULL=148;
      popSAFEEXTRACT=149;
      popSAFEGETMEMBER=150;
      popSETCONSTLOCAL=151;
      popCOUNT=152;
`;

/*
let result = "";
let pos = 0;
let newIndex = 0;

// Loop through the entire input string
while (pos < pascalConsts.length) {
  // Look for the next '=' character
  let eqPos = pascalConsts.indexOf("=", pos);
  if (eqPos === -1) {
    // No more equals found; append remaining text.
    result += pascalConsts.substring(pos);
    break;
  }
  
  // Append everything up to and including the '='
  result += pascalConsts.substring(pos, eqPos + 1);
  pos = eqPos + 1;
  
  // Append any whitespace following '='
  while (pos < pascalConsts.length &&
         (pascalConsts.charAt(pos) === " " || pascalConsts.charAt(pos) === "\t")) {
    result += pascalConsts.charAt(pos);
    pos++;
  }
  
  // Skip over the old number (assumed to be a sequence of digits)
  while (pos < pascalConsts.length &&
         pascalConsts.charAt(pos) >= "0" && pascalConsts.charAt(pos) <= "9") {
    pos++;
  }
  
  // Insert the new sequential number
  result += newIndex.toString();
  newIndex++;
  
  // Append the rest of the line up to and including the next ';'
  let semiPos = pascalConsts.indexOf(";", pos);
  if (semiPos === -1) {
    // No semicolon found, append remainder and exit.
    result += pascalConsts.substring(pos);
    pos = pascalConsts.length;
  } else {
    result += pascalConsts.substring(pos, semiPos + 1);
    pos = semiPos + 1;
  }
}

console.log(result);
*/

let newIndex = 0;
const lines = pascalConsts.split("\n");
for(let i = 0; i < lines.length; i++){
  const line = lines[i];
  const assignPos = line.indexOf("=");
  if (assignPos !== -1) {
    let numberStart = assignPos + 1;
    while((numberStart < line.length) && ((line[numberStart] === " ") || (line[numberStart] === "\t"))){
      numberStart++;
    }
    let numberEnd = numberStart;
    while((numberEnd < line.length) && (line[numberEnd] >= "0" && line[numberEnd] <= "9")){
      numberEnd++;
    }
    const newLine = line.substring(0, numberStart) + newIndex.toString() + line.substring(numberEnd);
    lines[i] = newLine;
    newIndex++;
  }
}
const result = lines.join("\n");
console.log(result);
