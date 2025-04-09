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
      popLOADCONST=28;
      popLOADONE=29;
      popLOADZERO=30;
      popLOADINT32=31;
      popLOADNULL=32;
      popLOADTHAT=33;
      popLOADTHIS=34;
      popLOADSELF=35;
      popLOADLOCAL=36;
      popCOPY=37;
      popINSERT=38;
      popEXTRACT=39;
      popGETMEMBER=40;
      popSETMEMBER=41;
      popGETLOCAL=42;
      popSETLOCAL=43;
      popGETLOCALVALUE=44;
      popSETLOCALVALUE=45;
      popGETOUTERVALUE=44;
      popSETOUTERVALUE=45;
      popNEWARRAY=46;
      popARRAYPUSH=47;
      popARRAYRANGEPUSH=48;
      popNEWHASH=49;
      popHASHAPPEND=50;
      popSETSYM=51;
      popINDEX=52;
      popFCALLH=53;
      popMCALLH=54;
      popUNPACK=55;
      popSLICE=56;
      popSLICE2=57;
      popSLICE3=58;
      popTRY=59;
      popTRYBLOCKEND=60;
      popTHROW=61;
      popDEC=62;
      popINC=63;
      popBAND=64;
      popBXOR=65;
      popBOR=66;
      popBNOT=67;
      popBSHL=68;
      popBSHR=69;
      popBUSHR=70;
      popMOD=71;
      popPOW=72;
      popINHERITEDGETMEMBER=73;
      popKEY=74;
      popIN=75;
      popINRANGE=76;
      popFTAILCALL=77;
      popMTAILCALL=78;
      popFTAILCALLH=79;
      popMTAILCALLH=80;
      popINSTANCEOF=81;
      popBREAKPOINT=82;
      popNUM=83;
      popN_NOT=84;
      popN_ADD=85;
      popN_SUB=86;
      popN_MUL=87;
      popN_DIV=88;
      popN_NEG=89;
      popN_LT=90;
      popN_LTEQ=91;
      popN_GT=92;
      popN_GTEQ=93;
      popN_EQ=94;
      popN_NEQ=95;
      popN_CMP=96;
      popN_DEC=97;
      popN_INC=98;
      popN_BAND=99;
      popN_BXOR=100;
      popN_BOR=101;
      popN_BNOT=102;
      popN_BSHL=103;
      popN_BSHR=104;
      popN_BUSHR=105;
      popN_MOD=106;
      popN_POW=107;
      popN_INRANGE=108;
      popN_JIFTRUE=109;
      popN_JIFFALSE=110;
      popN_JIFTRUELOOP=111;
      popN_JIFFALSELOOP=112;
      popN_JIFLT=113;
      popN_JIFLTEQ=114;
      popN_JIFGT=115;
      popN_JIFGTEQ=116;
      popN_JIFEQ=117;
      popN_JIFNEQ=118;
      popN_JIFLTLOOP=119;
      popN_JIFLTEQLOOP=120;
      popN_JIFGTLOOP=121;
      popN_JIFGTEQLOOP=122;
      popN_JIFEQLOOP=123;
      popN_JIFNEQLOOP=124;
      popUPDATESTRING=125;
      popREGEXP=126;
      popREGEXPEQ=127;
      popREGEXPNEQ=128;
      popSQRT=129;
      popN_SQRT=130;
      popGETPROTOTYPE=131;
      popSETPROTOTYPE=132;
      popGETCONSTRUCTOR=133;
      popSETCONSTRUCTOR=134;
      popDELETE=135;
      popDELETEEX=136;
      popDEFINED=137;
      popDEFINEDEX=138;
      popLOADGLOBAL=139;
      popLOADBASECLASS=140;
      popGETHASHKIND=141;
      popSETHASHKIND=142;
      popTYPEOF=143;
      popIDOF=144;
      popGHOSTTYPEOF=145;
      popELVIS=146;
      popIS=147;
      popJIFNULL=148;
      popJIFNOTNULL=149;
      popSAFEEXTRACT=150;
      popSAFEGETMEMBER=151;
      popSETCONSTLOCAL=152;
      popCOUNT=153;
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
