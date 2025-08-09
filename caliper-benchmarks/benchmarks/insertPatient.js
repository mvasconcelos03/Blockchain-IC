'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const fs = require("fs");

class InsertPatientWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.position = 78;
    }

    async submitTransaction() {
        const fd = fs.openSync("./data/PATIENTS.csv", 'r');
        let line = "";
        const charBuffer = Buffer.alloc(1);

        while (charBuffer.toString() !== '\n') {
            fs.readSync(fd, charBuffer, 0, 1, this.position);
            this.position++;
            line += charBuffer.toString();
        }

        if (charBuffer.toString() === '\n') {
            line = line.replace(/\r?\n/g, "");
            let entries = line.split(",");

            let args = {
                contractId: 'marbles',
                contractVersion: 'v0',
                contractFunction: 'insertPatient',
                contractArguments: [
                    entries[0], entries[1], entries[2],
                    entries[3], entries[4], entries[5], entries[6], entries[7]
                ],
                timeout: 4000
            };

            let result = await this.sutAdapter.sendRequests(args);
            
            if (result && result.GetTimeFinal && result.GetTimeCreate) {
                let executionTime = result.GetTimeFinal() - result.GetTimeCreate();
                try {
                    fs.appendFileSync('./data/EXECUTION_TIME.txt', executionTime + '\n');
                } catch (e) {
                    console.log(e);
                    throw e;
                }
            }
        }

        fs.closeSync(fd);
    }

    async cleanupWorkload() {
        // Lógica de limpeza, se necessário
    }
}

function createWorkloadModule() {
    return new InsertPatientWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;