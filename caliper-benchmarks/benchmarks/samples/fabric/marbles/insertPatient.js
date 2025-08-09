'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const fs = require("fs");

class InsertPatientWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.bc = null;
        this.contx = null;
        this.position = 78;
    }

    async initializeWorkload(context, roundIndex, roundArguments) {
        this.bc = context.engine.getBlockchain();
        this.contx = context;
        console.log(`Starting Round ${roundIndex}: ${this.info}`);
    }

    async submitTransaction() {
        const fd = fs.openSync("path/to/file/mimiciii/PATIENTS.csv", 'r');
        let line = "";
        const charBuffer = Buffer.alloc(1);
        let args = [];

        while (charBuffer.toString() !== '\n') {
            fs.readSync(fd, charBuffer, 0, 1, this.position);
            this.position++;
            line += charBuffer.toString();
        }

        if (charBuffer.toString() === '\n') {
            line = line.replace(/\r?\n/g, "");
            let entries = line.split(",");

            if (this.bc.getType() === 'fabric') {
                args.push({
                    chaincodeFunction: 'insertPatient',
                    chaincodeArguments: [
                        entries[0], entries[1], entries[2],
                        entries[3], entries[4], entries[5], entries[6], entries[7]
                    ],
                });
            }
            line = "";
        }

        fs.closeSync(fd);

        let results = await this.bc.invokeSmartContract(this.contx, 'testecouch', 'v0', args, 4000);

        for (let result of results) {
            let executionTime = result.GetTimeFinal() - result.GetTimeCreate();
            try {
                fs.appendFileSync('path/to/file/EXECUTION_TIME', executionTime + '\n');
            } catch (e) {
                console.log(e);
                throw e;
            }
        }
        return results;
    }

    async cleanupWorkload() {
        // Lógica de limpeza, se necessário
    }
}

function createWorkloadModule() {
    return new InsertPatientWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;