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
      popGETLENGTH=40;
      popGETMEMBER=40;
      popSETMEMBER=41;
      popGETLOCAL=42;
      popSETLOCAL=43;
      popGETLOCALVALUE=44;
      popSETLOCALVALUE=45;
      popGETOUTERVALUE=46;
      popSETOUTERVALUE=47;
      popNEWARRAY=48;
      popARRAYPUSH=49;
      popARRAYRANGEPUSH=50;
      popNEWHASH=51;
      popHASHAPPEND=52;
      popSETSYM=53;
      popINDEX=54;
      popFCALLH=55;
      popMCALLH=56;
      popUNPACK=57;
      popSLICE=58;
      popSLICE2=59;
      popSLICE3=60;
      popTRY=61;
      popTRYBLOCKEND=62;
      popTHROW=63;
      popDEC=64;
      popINC=65;
      popBAND=66;
      popBXOR=67;
      popBOR=68;
      popBNOT=69;
      popBSHL=70;
      popBSHR=71;
      popBUSHR=72;
      popMOD=73;
      popPOW=74;
      popINHERITEDGETMEMBER=75;
      popKEY=76;
      popIN=77;
      popINRANGE=78;
      popFTAILCALL=79;
      popMTAILCALL=80;
      popFTAILCALLH=81;
      popMTAILCALLH=82;
      popINSTANCEOF=83;
      popBREAKPOINT=84;
      popNUM=85;
      popN_NOT=86;
      popN_ADD=87;
      popN_SUB=88;
      popN_MUL=89;
      popN_DIV=90;
      popN_NEG=91;
      popN_LT=92;
      popN_LTEQ=93;
      popN_GT=94;
      popN_GTEQ=95;
      popN_EQ=96;
      popN_NEQ=97;
      popN_CMP=98;
      popN_DEC=99;
      popN_INC=100;
      popN_BAND=101;
      popN_BXOR=102;
      popN_BOR=103;
      popN_BNOT=104;
      popN_BSHL=105;
      popN_BSHR=106;
      popN_BUSHR=107;
      popN_MOD=108;
      popN_POW=109;
      popN_INRANGE=110;
      popN_JIFTRUE=111;
      popN_JIFFALSE=112;
      popN_JIFTRUELOOP=113;
      popN_JIFFALSELOOP=114;
      popN_JIFLT=115;
      popN_JIFLTEQ=116;
      popN_JIFGT=117;
      popN_JIFGTEQ=118;
      popN_JIFEQ=119;
      popN_JIFNEQ=120;
      popN_JIFLTLOOP=121;
      popN_JIFLTEQLOOP=122;
      popN_JIFGTLOOP=123;
      popN_JIFGTEQLOOP=124;
      popN_JIFEQLOOP=125;
      popN_JIFNEQLOOP=126;
      popUPDATESTRING=127;
      popREGEXP=128;
      popREGEXPEQ=129;
      popREGEXPNEQ=130;
      popSQRT=131;
      popN_SQRT=132;
      popGETPROTOTYPE=133;
      popSETPROTOTYPE=134;
      popGETCONSTRUCTOR=135;
      popSETCONSTRUCTOR=136;
      popDELETE=137;
      popDELETEEX=138;
      popDEFINED=139;
      popDEFINEDEX=140;
      popLOADGLOBAL=141;
      popLOADBASECLASS=142;
      popGETHASHKIND=143;
      popSETHASHKIND=144;
      popTYPEOF=145;
      popIDOF=146;
      popGHOSTTYPEOF=147;
      popELVIS=148;
      popIS=149;
      popJIFNULL=150;
      popJIFNOTNULL=151;
      popSAFEEXTRACT=152;
      popSAFEGETMEMBER=153;
      popSETCONSTLOCAL=154;
      popCOUNT=155;
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
