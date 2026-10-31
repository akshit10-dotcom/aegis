// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 17335422444824025854644386796339557602686237979558215297173755330335619408702;
    uint256 constant alphay  = 16858803070161361972452170226006720539115145508591265815761636528712393658794;
    uint256 constant betax1  = 9955736166826813528574720597612837541103059566530652112956888448317228059662;
    uint256 constant betax2  = 10897983485506524988635350739745860855298099476991037408074191546908525328472;
    uint256 constant betay1  = 20983179071074426340024853504190049493400259084008814337102761424041280365606;
    uint256 constant betay2  = 5656426367075918594254814903134462310881898764946372912552251522447433668227;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 14543700507905634407171020085173589982445193701423143672951570499150819770254;
    uint256 constant deltax2 = 18975726631254799191621338894152032291646674147124899754806054203460072621938;
    uint256 constant deltay1 = 6465684849613694127776943259265926073762456052199890019688805835375647750261;
    uint256 constant deltay2 = 8823592708707994161708990210376325878478632095542598550956754690357516486989;

    
    uint256 constant IC0x = 4893348252814940471954163456523713868302923741288203137243852245396535653627;
    uint256 constant IC0y = 6984941132266432170879886037774572895221650263108690558138066294392069658688;
    
    uint256 constant IC1x = 16135504367701012752199056110127889490692333872840361411809029826476683384005;
    uint256 constant IC1y = 21394157752568704327445538593835034422668125089194876774307232895599325430005;
    
    uint256 constant IC2x = 16398220428843172530252762499647425822120318707773138613144164850485720171588;
    uint256 constant IC2y = 4737735354222619966400463782564636538088149987755117781963272856299419061981;
    
    uint256 constant IC3x = 18343063455394162396563941175551809620498444124718243289154101728198665049814;
    uint256 constant IC3y = 11629676179019952015411078335319877103073352514444240288277327429744388936005;
    
    uint256 constant IC4x = 4275390590215414674478557368350821986272579313237800377298447183299192872369;
    uint256 constant IC4y = 14582101476192924854664837774616537275842649805631193064314066631891606823027;
    
    uint256 constant IC5x = 20563591762960685840291432830467874930582960971161930921195299692760260771733;
    uint256 constant IC5y = 11364523644558129362469347775405210042682348912138263541186152072057799650405;
    
    uint256 constant IC6x = 8231625099991379271003259802169218745274940537274393362003492689417807834129;
    uint256 constant IC6y = 11424064594148060595148573853845340650258183718435017804405122269615794160469;
    
    uint256 constant IC7x = 11379278451077077838234747224494990298876898737316785888883850351762638954821;
    uint256 constant IC7y = 6302577487536658208011968660387956624572065928320668905880000705409799667826;
    
    uint256 constant IC8x = 1981208440301510262892992986203734029164559421635480867559018575151404307205;
    uint256 constant IC8y = 2867364639736809346569736814150380224996309190737690422014570968715240002427;
    
    uint256 constant IC9x = 19552664607654037207468316842010447673219503053706616172050479883185282470702;
    uint256 constant IC9y = 1472659142789128834008246269900719716076648681334405348275647989118416490191;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[9] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
